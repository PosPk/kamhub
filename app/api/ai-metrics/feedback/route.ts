/**
 * API ENDPOINT: AI Metrics Feedback
 * Обработка обратной связи от пользователей
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiMetrics } from '@/lib/ai/metrics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sessionId, 
      userId, 
      feedbackType, 
      completed,
      userMessage,
      aiMessage 
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // 1. Track Action Completion
    if (completed !== undefined) {
      await aiMetrics.trackActionCompletion({
        sessionId,
        userId,
        userMessage: userMessage || '',
        aiResponse: aiMessage || '',
        completed: completed === true,
      });
    }

    // 2. Track Conversation Quality
    const satisfied = feedbackType === 'helpful';
    await aiMetrics.trackConversationQuality({
      sessionId,
      userId,
      satisfied,
    });

    // 3. Save feedback to database
    await aiMetrics.saveFeedback({
      sessionId,
      userId,
      feedbackType: feedbackType === 'helpful' ? 'thumbs_up' : 'thumbs_down',
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
    });

  } catch (error) {
    console.error('Error recording feedback:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to record feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
