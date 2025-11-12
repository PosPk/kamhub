'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
  color: string;
}

interface FeaturesSectionProps {
  features: Feature[];
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section className="w-full bg-gradient-to-br from-green-50/40 via-emerald-50/30 to-teal-50/40 py-4 lg:py-3">
      <div className="text-center mb-3 lg:mb-2 px-4">
        <h2 className="text-lg lg:text-xl font-extralight mb-0.5 text-gray-800">
          Уникальные возможности
        </h2>
        <p className="text-xs font-light text-gray-600 hidden lg:block">
          Технологии для современного туризма
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 px-4 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-white/60 backdrop-blur-2xl p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-white/40 hover:bg-white/80 transition-all shadow-lg hover:shadow-xl"
          >
            <feature.icon className={`w-8 h-8 lg:w-10 lg:h-10 text-${feature.color}-500 mb-2 lg:mb-3 mx-auto lg:mx-0`} />
            <h3 className="text-sm lg:text-base font-light text-gray-800 mb-1 lg:mb-2 text-center lg:text-left">
              {feature.title}
            </h3>
            <p className="text-gray-600 font-light text-xs mb-2 hidden lg:block">
              {feature.description}
            </p>
            <Link 
              href={feature.link} 
              className={`inline-flex items-center justify-center lg:justify-start gap-1 text-${feature.color}-600 text-xs font-light hover:gap-1.5 transition-all w-full lg:w-auto`}
            >
              <span className="hidden lg:inline">Подробнее</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
