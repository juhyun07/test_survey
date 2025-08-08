'use client';

import { HashRouterProvider } from '@/components/HashRouterProvider';
import SurveyResultListPage from './SurveyResultListPage';
import SurveyResultDetailPage from './SurveyResultDetailPage';

const routes = {
  ':submissionId': SurveyResultDetailPage,
  '': SurveyResultListPage,
};

const NotFound = () => <div>페이지를 찾을 수 없습니다.</div>;

export default function SurveyResultsPage() {
  return <HashRouterProvider routes={routes} fallback={NotFound} />;
}
