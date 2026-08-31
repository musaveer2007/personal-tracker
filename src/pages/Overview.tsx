import { DashboardHero } from '../components/dashboard/DashboardHero';
import { TodayScore, TodayChecklist } from '../components/dashboard/TodayComponents';

export const Overview = () => {
  return (
    <div className="pb-12">
      <DashboardHero />
      <TodayScore />
      <TodayChecklist />
    </div>
  );
};
