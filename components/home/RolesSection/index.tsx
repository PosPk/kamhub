'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Role {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color: string;
  href: string;
}

interface RolesSectionProps {
  roles: Role[];
}

export function RolesSection({ roles }: RolesSectionProps) {
  return (
    <section className="w-full bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 py-4 lg:py-3 overflow-hidden">
      <div className="text-center mb-3 lg:mb-2 px-4">
        <h2 className="text-lg lg:text-xl font-extralight mb-0.5 text-gray-800">
          Выберите свою роль
        </h2>
        <p className="text-xs font-light text-gray-600 hidden lg:block">
          Каждая роль открывает уникальные возможности
        </p>
      </div>

      <div className="flex lg:grid lg:grid-cols-2 gap-3 lg:gap-6 px-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 snap-x snap-mandatory lg:snap-none scrollbar-hide lg:max-w-4xl lg:mx-auto">
        {roles.map((role) => (
          <Link 
            key={role.id}
            href={role.href}
            className="group flex-shrink-0 w-56 lg:w-full snap-center relative"
          >
            {/* Ripple effect background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/20 group-hover:to-transparent rounded-xl lg:rounded-2xl transition-all duration-700"></div>
            
            <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-white/40 hover:bg-white/80 hover:scale-105 lg:hover:scale-110 hover:-translate-y-1 lg:hover:-translate-y-3 transition-all duration-300 shadow-lg hover:shadow-2xl h-full overflow-hidden">
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000"></div>
              </div>
              
              {/* Icon */}
              <div className={`w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${role.color} backdrop-blur-xl rounded-2xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300 shadow-lg relative mx-auto`}>
                <role.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 rounded-2xl transition-all duration-300"></div>
              </div>
              
              {/* Content */}
              <h3 className="text-lg lg:text-2xl font-light mb-1 lg:mb-2 text-gray-800 group-hover:text-gray-900 transition-colors text-center">
                {role.title}
              </h3>
              <p className="text-gray-600 mb-3 lg:mb-4 font-light text-sm lg:text-base text-center">
                {role.subtitle}
              </p>
              
              {/* Arrow with pulse */}
              <div className="flex items-center justify-center gap-1 lg:gap-2 text-blue-600 font-light group-hover:gap-2 lg:group-hover:gap-3 transition-all text-sm">
                <span className="group-hover:font-medium transition-all">Открыть</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:scale-125 transition-all" />
              </div>
              
              {/* Corner accent */}
              <div className={`absolute top-3 right-3 w-3 h-3 bg-gradient-to-br ${role.color} rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300`}></div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
