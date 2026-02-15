import { useState, useEffect } from 'react';
import { gamificationService, Achievement, UserAchievement } from '../../api/gamificationService';
import Card from '../../components/Card';
import Skeleton from '../../components/Skeleton';

const GamificationPage = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'earned'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [achievementsRes, userAchievementsRes, pointsRes] = await Promise.all([
        gamificationService.getAllAchievements(),
        gamificationService.getMyAchievements(),
        gamificationService.getMyPoints(),
      ]);
      setAchievements(achievementsRes.data);
      setUserAchievements(userAchievementsRes.data);
      setTotalPoints(pointsRes.data.totalPoints);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAchievementEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievementId === achievementId);
  };

  const getLevel = (points: number) => {
    if (points >= 5000) return { name: 'Diamond', color: 'text-blue-600' };
    if (points >= 2000) return { name: 'Platinum', color: 'text-purple-600' };
    if (points >= 1000) return { name: 'Gold', color: 'text-yellow-600' };
    if (points >= 500) return { name: 'Silver', color: 'text-gray-500' };
    return { name: 'Bronze', color: 'text-orange-600' };
  };

  const level = getLevel(totalPoints);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const displayedAchievements = activeTab === 'earned' 
    ? userAchievements 
    : achievements;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Achievements & Rewards</h1>

      {/* Stats Card */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{totalPoints}</div>
            <div className="text-gray-600 mt-1">Total Points</div>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${level.color}`}>{level.name}</div>
            <div className="text-gray-600 mt-1">Current Level</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">{userAchievements.length}</div>
            <div className="text-gray-600 mt-1">Achievements Earned</div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          All Achievements ({achievements.length})
        </button>
        <button
          onClick={() => setActiveTab('earned')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'earned'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Earned ({userAchievements.length})
        </button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTab === 'all' && achievements.map(achievement => {
          const earned = isAchievementEarned(achievement.id);
          return (
            <Card key={achievement.id} className={`${earned ? 'border-2 border-green-500' : 'opacity-60'}`}>
              <div className="flex items-start gap-4">
                <div 
                  className="text-4xl p-3 rounded-full"
                  style={{ backgroundColor: achievement.badgeColor + '20' }}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{achievement.name}</h3>
                    {earned && <span className="text-green-600">✓</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-semibold text-blue-600">
                      {achievement.points} points
                    </span>
                    <span className="text-xs text-gray-500">
                      {achievement.achievementType}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {activeTab === 'earned' && userAchievements.map(userAchievement => (
          <Card key={userAchievement.id} className="border-2 border-green-500">
            <div className="flex items-start gap-4">
              <div 
                className="text-4xl p-3 rounded-full"
                style={{ backgroundColor: userAchievement.badgeColor + '20' }}
              >
                {userAchievement.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{userAchievement.achievementName}</h3>
                  <span className="text-green-600">✓</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{userAchievement.achievementDescription}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-semibold text-blue-600">
                    {userAchievement.points} points
                  </span>
                  <span className="text-xs text-gray-500">
                    Earned: {new Date(userAchievement.earnedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {displayedAchievements.length === 0 && (
        <Card>
          <p className="text-center text-gray-500 py-8">
            {activeTab === 'earned' 
              ? 'No achievements earned yet. Keep using the app to earn your first achievement!' 
              : 'No achievements available.'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default GamificationPage;
