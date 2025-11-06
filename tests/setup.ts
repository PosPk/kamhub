/**
 * Setup для тестов
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup после каждого теста
afterEach(() => {
  cleanup();
});

