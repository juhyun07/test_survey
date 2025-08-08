'use client';


import { HashRouterProvider } from '@/components/HashRouterProvider';
import Survey2ListPage from './Survey2ListPage';
import SurveyEditor from './SurveyEditor';

const routes = {
  ':id': SurveyEditor,
  '': Survey2ListPage,
};

const NotFound = () => <div>페이지를 찾을 수 없습니다.</div>;

export default function Survey2Page() {
  return <HashRouterProvider routes={routes} fallback={NotFound} />;
}
