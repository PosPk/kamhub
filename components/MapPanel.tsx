'use client';

import React from 'react';
import { Mountain, Waves, Droplets, ArrowRight, X } from 'lucide-react';
import './MapPanel.css';

interface MapPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Точки активностей на Камчатке
const activities = [
  { id: 1, name: 'Авачинский вулкан', lat: 53.2553, lng: 158.8333, category: 'volcano', tours: 12 },
  { id: 2, name: 'Курильское озеро', lat: 51.4567, lng: 157.1234, category: 'wildlife', tours: 8 },
  { id: 3, name: 'Долина гейзеров', lat: 54.4333, lng: 160.1500, category: 'nature', tours: 15 },
  { id: 4, name: 'Мутновский вулкан', lat: 52.4500, lng: 158.1833, category: 'volcano', tours: 10 },
  { id: 5, name: 'Халактырский пляж', lat: 53.0667, lng: 158.7000, category: 'ocean', tours: 5 },
  { id: 6, name: 'Вилючинский вулкан', lat: 52.6922, lng: 158.2783, category: 'volcano', tours: 7 },
  { id: 7, name: 'Паратунка', lat: 52.9500, lng: 158.2500, category: 'hot-springs', tours: 6 }
];

const categoryIconComponents: Record<string, React.ElementType> = {
  volcano: Mountain,
  wildlife: Mountain,
  nature: Mountain,
  ocean: Waves,
  'hot-springs': Droplets
};

export function MapPanel({ isOpen, onClose }: MapPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="map-panel-overlay" onClick={onClose}></div>
      <div className="map-panel">
        <div className="map-panel-header">
          <div className="map-panel-title">
            <img src="/icons/kam-button.svg" alt="Карта" width="24" height="24" />
            <h3>Карта активностей</h3>
          </div>
          <button className="map-panel-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="map-panel-content">
          {/* ВРЕМЕННАЯ КАРТА (замените на настоящую) */}
          <div className="map-placeholder">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2377888.3478957187!2d156.5!3d53.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x58cf7603478840fb%3A0x4aaa0c7b4f5da600!2z0JrQsNC80YfQsNGC0LrQsA!5e0!3m2!1sru!2sru!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>

          {/* СПИСОК АКТИВНОСТЕЙ */}
          <div className="activities-list">
            <h4>Точки на карте ({activities.length})</h4>
            {activities.map((activity) => {
              const IconComponent = categoryIconComponents[activity.category] || Mountain;
              return (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <IconComponent size={20} />
                  </div>
                  <div className="activity-info">
                    <div className="activity-name">{activity.name}</div>
                    <div className="activity-meta">
                      <span>{activity.tours} туров</span>
                      <span>•</span>
                      <span className="activity-category">{activity.category}</span>
                    </div>
                  </div>
                  <button className="activity-view">
                    <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
