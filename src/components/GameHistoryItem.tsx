import { getSectionInfo } from '@/lib/mathGenerator';

interface GameHistoryItemProps {
  section: string;
  correct: number;
  incorrect: number;
  score: number;
  createdAt: string;
  delay?: number;
}

export const GameHistoryItem = ({
  section,
  correct,
  incorrect,
  score,
  createdAt,
  delay = 0,
}: GameHistoryItemProps) => {
  const total = correct + incorrect;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const sectionInfo = getSectionInfo(section as any);

  return (
    <div
      className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-secondary/50 to-secondary/30 border border-border/30 hover:border-primary/30 transition-all duration-200 opacity-0 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center gap-4">
        <div className="text-3xl">{sectionInfo.icon}</div>
        <div>
          <p className="font-display font-bold text-foreground">
            {sectionInfo.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(createdAt).toLocaleDateString('uz-UZ', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-display font-bold text-primary text-lg">+{score}</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-success">{correct} ✓</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{accuracy}%</span>
        </div>
      </div>
    </div>
  );
};
