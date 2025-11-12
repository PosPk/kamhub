/**
 * API ENDPOINT: AI Metrics Summary
 * Получение агрегированной статистики по метрикам AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');

    // Получаем основные метрики
    const metricsResult = await query(`
      SELECT 
        -- Completion Rate
        ROUND(
          AVG(CASE WHEN metric_type = 'action_completion' THEN metric_value ELSE NULL END) * 100, 
          1
        ) as completion_rate,
        
        COUNT(CASE WHEN metric_type = 'action_completion' AND metric_value = 1 THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN metric_type = 'action_completion' THEN 1 END) as total_tasks,
        
        -- Satisfaction Rate
        ROUND(
          AVG(CASE WHEN metric_type = 'conversation_quality' THEN metric_value ELSE NULL END) * 100, 
          1
        ) as satisfaction_rate,
        
        COUNT(CASE WHEN metric_type = 'conversation_quality' AND metric_value = 1 THEN 1 END) as satisfied_users,
        COUNT(CASE WHEN metric_type = 'conversation_quality' THEN 1 END) as total_feedbacks,
        
        -- Tool Error Rate
        ROUND(
          (1 - COALESCE(
            AVG(CASE WHEN metric_type = 'tool_execution' AND success = false THEN 1 ELSE 0 END), 
            0
          )) * 100, 
          1
        ) as tool_success_rate,
        
        COUNT(CASE WHEN metric_type = 'tool_execution' AND success = false THEN 1 END) as tool_errors,
        COUNT(CASE WHEN metric_type = 'tool_execution' THEN 1 END) as total_tool_calls,
        
        -- Average Efficiency
        ROUND(
          AVG(CASE WHEN metric_type = 'agent_efficiency' THEN metric_value ELSE NULL END) * 100, 
          1
        ) as avg_efficiency,
        
        -- Average Latency
        ROUND(AVG(latency)) as avg_latency,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency)) as p95_latency
        
      FROM ai_metrics
      WHERE created_at >= NOW() - INTERVAL '${days} days'
    `);

    // Получаем статистику по инструментам
    const toolStatsResult = await query(`
      SELECT 
        tool_name,
        COUNT(*) as call_count,
        COUNT(CASE WHEN success = false THEN 1 END) as error_count,
        ROUND(AVG(latency)) as avg_latency
      FROM ai_metrics
      WHERE metric_type = 'tool_execution'
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY tool_name
      ORDER BY error_count DESC
      LIMIT 5
    `);

    // Получаем статистику по сессиям
    const sessionStatsResult = await query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN task_completed = true THEN 1 END) as completed_sessions,
        ROUND(AVG(total_messages), 1) as avg_messages
      FROM ai_chat_sessions
      WHERE started_at >= NOW() - INTERVAL '${days} days'
    `);

    // Получаем тренд по дням
    const trendResult = await query(`
      SELECT 
        date_trunc('day', created_at)::date as date,
        COUNT(CASE WHEN metric_type = 'action_completion' AND metric_value = 1 THEN 1 END) as completed_count,
        COUNT(CASE WHEN metric_type = 'conversation_quality' AND metric_value = 1 THEN 1 END) as satisfied_count
      FROM ai_metrics
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY date_trunc('day', created_at)
      ORDER BY date DESC
      LIMIT 7
    `);

    const metrics = metricsResult.rows[0];
    const toolStats = toolStatsResult.rows;
    const sessionStats = sessionStatsResult.rows[0];
    const trend = trendResult.rows;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          completionRate: parseFloat(metrics.completion_rate) || 0,
          completedTasks: parseInt(metrics.completed_tasks) || 0,
          totalTasks: parseInt(metrics.total_tasks) || 0,
          
          satisfactionRate: parseFloat(metrics.satisfaction_rate) || 0,
          satisfiedUsers: parseInt(metrics.satisfied_users) || 0,
          totalFeedbacks: parseInt(metrics.total_feedbacks) || 0,
          
          toolSuccessRate: parseFloat(metrics.tool_success_rate) || 0,
          toolErrors: parseInt(metrics.tool_errors) || 0,
          totalToolCalls: parseInt(metrics.total_tool_calls) || 0,
          
          avgEfficiency: parseFloat(metrics.avg_efficiency) || 0,
          avgLatency: parseInt(metrics.avg_latency) || 0,
          p95Latency: parseInt(metrics.p95_latency) || 0,
        },
        
        topErrors: toolStats.map(tool => ({
          tool: tool.tool_name,
          count: parseInt(tool.error_count),
          totalCalls: parseInt(tool.call_count),
          avgLatency: parseInt(tool.avg_latency),
        })),
        
        sessions: {
          total: parseInt(sessionStats.total_sessions) || 0,
          completed: parseInt(sessionStats.completed_sessions) || 0,
          avgMessages: parseFloat(sessionStats.avg_messages) || 0,
        },
        
        trend: trend.map(day => ({
          date: day.date,
          completed: parseInt(day.completed_count) || 0,
          satisfied: parseInt(day.satisfied_count) || 0,
        })),
        
        period: `${days} days`,
      },
    });

  } catch (error) {
    console.error('Error fetching AI metrics summary:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
