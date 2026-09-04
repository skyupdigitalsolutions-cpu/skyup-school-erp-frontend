import { configureStore } from '@reduxjs/toolkit';
import studentReducer from '@/features/principal/studentSlice';
import teacherReducer from '@/features/principal/teacherSlice';
import caretakerReducer from '@/features/caretaker/caretakerSlice';
import eventsReducer from '@/features/events/eventsSlice';
import examsReducer from '@/features/exams/examsSlice';
import classesReducer from '@/features/classes/classSlice';
import dashboardReducer from '@/features/dashboard/dashboardSlice';
import noticesReducer from '@/features/notices/noticeSlice';
import reportsReducer from '@/features/reports/reportSlice';
import financeReducer from '@/features/finance/financeSlice';
import leaveManagementReducer from '@/features/leave-management/leaveSlice';

const rootReducer = {
  principalStudents: studentReducer,
  principalTeachers: teacherReducer,
  caretaker: caretakerReducer,
  events: eventsReducer,
  exams: examsReducer,
  classes: classesReducer,
  dashboard: dashboardReducer,
  notices: noticesReducer,
  reports: reportsReducer,
  finance: financeReducer,
  leaveManagement: leaveManagementReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: import.meta.env.MODE !== 'production',
});