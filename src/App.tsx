import { useSession } from './services/session';
import { HashRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { type ReactNode, useEffect } from 'react';
import { Landing, Auth } from './features/Public';
import { Onboarding } from './features/Onboarding';
import { Diagnostic } from './features/Diagnostic';
import { DiagnosticStatus, Progress, Readiness } from './features/dashboard/screens/Insights';
import { Dashboard } from './features/dashboard/screens/Dashboard';
import { LearningHub, LessonPage } from './features/Learning';
import { ModuleLibrary, WorkspaceRoute } from './features/Modules';
import { LearnCatalog, LearnCategoryPage } from './features/discovery/screens/LearnCatalog';
import { AllVocabularyExplorerScreen, VocabularyHubScreen } from './features/vocabulary/screens/VocabularyExplorer';
import { ResourceBankContextProvider } from './features/vocabulary/services/resourceBankHooks';
import { SkillHub, SkillInformation } from './features/discovery/screens/SkillHub';
import { IELTSAbout, IELTSAboutTopic } from './features/discovery/screens/IELTSAbout';
import { discoveryRoutes } from './features/discovery/routes';
import { AttemptResults } from './features/Results';
import { ExamAttempt, ExamCenter, ExamResult, ExamSetup, MockTests } from './features/Exam';
import { CoachPage, Vocabulary, Settings } from './features/Account';
import { ActivityLibrary } from './features/ActivityLibrary';
import { modules } from './domain';
import { useLearning } from './services/platform';
import { AppShell } from './components/AppShell';
import { LoadingPreview, PageErrorBoundary } from './components/Resilience';
import { EmptyState } from './components/UI';
import { learnerRouteRedirect, readState } from './state';
function RoutePolicy({ children }: { children: ReactNode }) {
  const location = useLocation(); const state = useLearning(); const active = useSession();
  const publicPaths = ['/', '/login', '/signup', '/register', '/forgot-password'];
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      document.querySelector('.main-scroll')?.scrollTo(0, 0);
      document.getElementById('main-content')?.focus({ preventScroll: true });
    });
    document.title = `${location.pathname.split('/')[1]?.replace(/-/g, ' ') || 'Your next step'} · AI IELTS Coach`;
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, state.exam?.section]);
  if (!active && !publicPaths.includes(location.pathname)) return <Navigate to="/" replace/>;
  if (active && !publicPaths.includes(location.pathname)) {
    const redirect = learnerRouteRedirect(location.pathname, readState());
    if (redirect) return <Navigate to={redirect} replace/>;
  }
  if (active && state.exam && !state.exam.complete && !['/exam', `/exam/attempt/${state.exam.id}`].includes(location.pathname)) return <Navigate to={`/exam/attempt/${state.exam.id}`} replace/>;
  return <>{children}</>;
}
function LegacyTask({ module }: { module: 'writing' | 'speaking' }) {
  const { id = '2' } = useParams();
  const allowed = module === 'writing' ? ['1', '2', 'letter'] : ['1', '2', '3'];
  return <Navigate to={`/${module}/practice/${module}-${allowed.includes(id) ? id : '2'}`} replace/>;
}
export default function App() { return <HashRouter><RoutePolicy><LoadingPreview><PageErrorBoundary><ResourceBankContextProvider><Routes>
  <Route path="/" element={<Landing/>}/><Route path="/login" element={<Auth kind="login"/>}/><Route path="/signup" element={<Auth kind="signup"/>}/><Route path="/register" element={<Navigate to="/signup" replace/>}/><Route path="/forgot-password" element={<Auth kind="forgot"/>}/>
  <Route path="/onboarding" element={<Onboarding/>}/><Route path="/diagnostic" element={<Diagnostic/>}/><Route path="/diagnostic/results" element={<DiagnosticStatus/>}/><Route path="/dashboard" element={<Dashboard/>}/>
  <Route path={discoveryRoutes.learn} element={<LearnCatalog/>}/><Route path={discoveryRoutes.vocabularyHub} element={<VocabularyHubScreen/>}/><Route path={discoveryRoutes.vocabularyExplorer} element={<AllVocabularyExplorerScreen/>}/><Route path={discoveryRoutes.vocabularyCategoryExplorer} element={<AllVocabularyExplorerScreen/>}/><Route path={discoveryRoutes.category} element={<LearnCategoryPage/>}/><Route path={discoveryRoutes.lessons} element={<LearningHub/>}/><Route path={discoveryRoutes.about} element={<IELTSAbout/>}/><Route path={discoveryRoutes.aboutTopic} element={<IELTSAboutTopic/>}/><Route path="/learn/:id" element={<LessonPage/>}/><Route path="/practice" element={<LearningHub practice/>}/><Route path="/practice/activity-library" element={<ActivityLibrary/>}/>
  {modules.map(module => <Route key={module} path={`/${module.toLowerCase()}`} element={<SkillHub module={module}/>}/>)}
  {modules.map(module => <Route key={`${module}-library`} path={`${'/'}${module.toLowerCase()}/library`} element={<ModuleLibrary module={module}/>}/>)}
  {modules.map(module => <Route key={`${module}-criteria`} path={`${'/'}${module.toLowerCase()}/scoring-criteria`} element={<SkillInformation module={module} criteria/>}/>)}
  {modules.map(module => <Route key={`${module}-information`} path={`${'/'}${module.toLowerCase()}/activities/:activityId`} element={<SkillInformation module={module}/>}/>)}
  {modules.map(module => <Route key={`${module}-legacy-exam`} path={`/${module.toLowerCase()}/exam`} element={<Navigate to="/exam" replace/>}/>)}
  {modules.map(module => <Route key={`${module}-legacy-exam-attempt`} path={`/${module.toLowerCase()}/exam/:id`} element={<Navigate to="/exam" replace/>}/>)}
  {modules.map(module => <Route key={module} path={`/${module.toLowerCase()}/:mode/:id`} element={<WorkspaceRoute module={module}/>}/>)}
  <Route path="/reading/practice" element={<Navigate to="/reading/practice/gardens" replace/>}/><Route path="/writing/task/:id" element={<LegacyTask module="writing"/>}/><Route path="/speaking/part/:id" element={<LegacyTask module="speaking"/>}/>
  <Route path="/results/:id" element={<AttemptResults/>}/><Route path="/progress" element={<Progress/>}/><Route path={discoveryRoutes.readiness} element={<Readiness/>}/><Route path="/readiness" element={<Navigate to={discoveryRoutes.readiness} replace/>}/><Route path="/mock-tests" element={<MockTests/>}/><Route path="/exam" element={<ExamCenter/>}/><Route path="/exam/setup" element={<ExamSetup/>}/><Route path="/exam/attempt/:attemptId" element={<ExamAttempt/>}/><Route path="/exam/result/:attemptId" element={<ExamResult/>}/><Route path="/exam-simulation" element={<Navigate to="/exam" replace/>}/>
  <Route path="/ai-coach" element={<CoachPage/>}/><Route path="/saved" element={<Vocabulary/>}/><Route path="/vocabulary" element={<Vocabulary/>}/><Route path="/settings" element={<Settings/>}/><Route path="/profile" element={<Navigate to="/settings" replace/>}/><Route path="/mistakes" element={<Navigate to="/progress" replace/>}/>
  <Route path="*" element={<AppShell><EmptyState title="This page isn’t available" detail="Use the navigation to continue learning, or return to your dashboard." action="Go to dashboard" onAction={() => { window.location.hash = '/dashboard'; }}/></AppShell>}/>
</Routes></ResourceBankContextProvider></PageErrorBoundary></LoadingPreview></RoutePolicy></HashRouter>; }





