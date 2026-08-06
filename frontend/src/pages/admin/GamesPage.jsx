import { Card, Switch, Popconfirm, Tag, message, Spin } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import * as adminService from '../../services/adminService';

const categoryColors = { Vocabulary: 'purple', Grammar: 'blue', Speaking: 'cyan', Listening: 'orange', default: 'default' };

const GAME_META = {
  MATCHING: { icon: '🎯', iconBg: 'linear-gradient(135deg, #667eea, #764ba2)', description: 'Match English words with their Vietnamese meanings in a time-limited challenge.', category: 'Vocabulary' },
  FILL_BLANK: { icon: '✏️', iconBg: 'linear-gradient(135deg, #f093fb, #f5576c)', description: 'Complete sentences by filling in missing words from context clues.', category: 'Grammar' },
  SPEAKING_GAME: { icon: '🎙️', iconBg: 'linear-gradient(135deg, #4facfe, #00f2fe)', description: 'Practice conversational English with our AI-powered speaking partner.', category: 'Speaking' },
};

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingToggle, setPendingToggle] = useState(null);

  useEffect(() => {
    adminService.listGameConfigs().then(res => {
      const data = res?.data || res;
      setGames(Array.isArray(data) ? data : []);
    }).catch(() => message.error('Failed to load game configs'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleConfirm = async () => {
    if (!pendingToggle) return;
    try {
      const res = await adminService.toggleGame(pendingToggle.gameType);
      const updated = res?.data || res;
      setGames(prev => prev.map(g => g.gameType === pendingToggle.gameType ? { ...g, isEnabled: updated.isEnabled } : g));
      message.success(`Game ${updated.isEnabled ? 'enabled' : 'disabled'} for all users`);
    } catch (e) {
      message.error('Failed to update game config');
    } finally {
      setPendingToggle(null);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><Spin size="large" /></div>;

  const enabledCount = games.filter(g => g.isEnabled).length;

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Mini-Game Configuration</h2>
        <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
          Enable or disable games for all users — {enabledCount} of {games.length} games active
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {games.map((game) => {
          const meta = GAME_META[game.gameType] || { icon: '🎮', iconBg: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', description: game.gameType, category: 'default' };
          return (
            <Card key={game.id}
              style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: game.isEnabled ? '1px solid #f0f0f0' : '1px solid #ffd6d6', opacity: game.isEnabled ? 1 : 0.85, transition: 'all 0.3s' }}
              styles={{ body: { padding: 24 } }}>
              <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                <div style={{ width: 72, height: 72, borderRadius: 18, background: meta.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{game.gameType.replace(/_/g, ' ')}</div>
                      <Tag color={categoryColors[meta.category] || 'default'} style={{ borderRadius: 20, fontSize: 11, marginBottom: 8 }}>{meta.category}</Tag>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <Popconfirm
                        title={
                          <div style={{ maxWidth: 240 }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{game.isEnabled ? 'Disable' : 'Enable'} {game.gameType}?</div>
                            <div style={{ color: '#666', fontSize: 12 }}>{game.isEnabled ? 'Are you sure you want to disable this game for all users?' : 'This will enable the game for all users immediately.'}</div>
                          </div>
                        }
                        onConfirm={handleToggleConfirm}
                        onCancel={() => setPendingToggle(null)}
                        okText={game.isEnabled ? 'Disable' : 'Enable'}
                        cancelText="Cancel"
                        okButtonProps={{ danger: game.isEnabled }}
                        open={pendingToggle?.gameType === game.gameType}
                      >
                        <Switch checked={game.isEnabled} onChange={(checked) => setPendingToggle({ gameType: game.gameType, next: checked })} style={{ backgroundColor: game.isEnabled ? '#6C63FF' : undefined }} />
                      </Popconfirm>
                      <span style={{ fontSize: 11, fontWeight: 600, color: game.isEnabled ? '#52c41a' : '#ff4d4f' }}>{game.isEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#666', margin: '0 0 10px', lineHeight: 1.6 }}>{meta.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
