'use client';

import { HashRouterProvider } from '@/components/HashRouterProvider';
import SurveyListPage from './SurveyListPage';
import SurveyTest from './SurveyTestComponent';

// Define the routes for the hash router
const routes = {
  ':id': SurveyTest,
  '': SurveyListPage,
};

export default function SurveyTestPageContainer() {
  return <HashRouterProvider routes={routes} fallback={SurveyListPage} />;
}
