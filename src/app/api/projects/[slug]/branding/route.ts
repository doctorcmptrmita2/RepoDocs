/**
 * Branding API Route
 * 
 * GET /api/projects/[slug]/branding - Get branding settings
 * PUT /api/projects/[slug]/branding - Update branding settings (full replace)
 * PATCH /api/projects/[slug]/branding - Partial update branding settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { 
  getCachedBranding, 
  cacheBranding, 
  invalidateBrandingCache 
} from '@/lib/cache';
import { 
  validateBrandingSettings, 
  sanitizeCustomCss 
} from '@/lib/branding/validation';
import type { BrandingSettings, BrandingUpdatePayload } from '@/types/branding';
import { DEFAULT_BRANDING, PLAN_RESTRICTED_FEATURES } from '@/types/branding';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Check if user has access to a plan-restricted feature
 */
function canAccessFeature(
  feature: keyof typeof PLAN_RESTRICTED_FEATURES,
  userPlan: string
): boolean {
  const allowedPlans = PLAN_RESTRICTED_FEATURES[feature];
  return allowedPlans.includes(userPlan as 'PRO' | 'TEAM');
}

/**
 * GET /api/projects/[slug]/branding
 * Returns branding settings for a project
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    
    // Try cache first
    const cached = await getCachedBranding(slug);
    if (cached) {
      return NextResponse.json(cached);
    }
    
    // Fetch from database
    const project = await db.project.findUnique({
      where: { slug },
      select: { branding: true },
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    const branding = (project.branding as BrandingSettings) || DEFAULT_BRANDING;
    
    // Cache for future requests
    await cacheBranding(slug, branding);
    
    return NextResponse.json(branding);
  } catch (error) {
    console.error('Error fetching branding:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branding settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[slug]/branding
 * Full replace of branding settings
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { slug } = await params;
    
    // Verify project ownership
    const project = await db.project.findFirst({
      where: { 
        slug,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { plan: true },
        },
      },
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }
    
    const body: BrandingUpdatePayload = await request.json();
    
    // Check plan restrictions
    const userPlan = project.user.plan;
    
    if (body.hidePoweredBy && !canAccessFeature('hidePoweredBy', userPlan)) {
      return NextResponse.json(
        { error: 'Hide branding requires PRO or TEAM plan', field: 'hidePoweredBy' },
        { status: 403 }
      );
    }
    
    if (body.customCss && !canAccessFeature('customCss', userPlan)) {
      return NextResponse.json(
        { error: 'Custom CSS requires PRO or TEAM plan', field: 'customCss' },
        { status: 403 }
      );
    }
    
    // Validate settings
    const validation = validateBrandingSettings(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }
    
    // Sanitize custom CSS if present
    const sanitizedBody = { ...body };
    if (sanitizedBody.customCss) {
      sanitizedBody.customCss = sanitizeCustomCss(sanitizedBody.customCss);
    }
    
    // Update database
    await db.project.update({
      where: { slug },
      data: { branding: sanitizedBody as object },
    });
    
    // Invalidate and update cache
    await invalidateBrandingCache(slug);
    await cacheBranding(slug, sanitizedBody as BrandingSettings);
    
    return NextResponse.json({ 
      success: true, 
      branding: sanitizedBody 
    });
  } catch (error) {
    console.error('Error updating branding:', error);
    return NextResponse.json(
      { error: 'Failed to update branding settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[slug]/branding
 * Partial update of branding settings
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { slug } = await params;
    
    // Verify project ownership
    const project = await db.project.findFirst({
      where: { 
        slug,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { plan: true },
        },
      },
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }
    
    const body: BrandingUpdatePayload = await request.json();
    
    // Check plan restrictions
    const userPlan = project.user.plan;
    
    if (body.hidePoweredBy !== undefined && body.hidePoweredBy && !canAccessFeature('hidePoweredBy', userPlan)) {
      return NextResponse.json(
        { error: 'Hide branding requires PRO or TEAM plan', field: 'hidePoweredBy' },
        { status: 403 }
      );
    }
    
    if (body.customCss !== undefined && body.customCss && !canAccessFeature('customCss', userPlan)) {
      return NextResponse.json(
        { error: 'Custom CSS requires PRO or TEAM plan', field: 'customCss' },
        { status: 403 }
      );
    }
    
    // Validate settings
    const validation = validateBrandingSettings(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }
    
    // Get current branding
    const currentBranding = (project.branding as BrandingSettings) || {};
    
    // Merge with new values
    const mergedBranding = { ...currentBranding, ...body };
    
    // Sanitize custom CSS if present
    if (mergedBranding.customCss) {
      mergedBranding.customCss = sanitizeCustomCss(mergedBranding.customCss);
    }
    
    // Update database
    await db.project.update({
      where: { slug },
      data: { branding: mergedBranding as object },
    });
    
    // Invalidate and update cache
    await invalidateBrandingCache(slug);
    await cacheBranding(slug, mergedBranding);
    
    return NextResponse.json({ 
      success: true, 
      branding: mergedBranding 
    });
  } catch (error) {
    console.error('Error updating branding:', error);
    return NextResponse.json(
      { error: 'Failed to update branding settings' },
      { status: 500 }
    );
  }
}
