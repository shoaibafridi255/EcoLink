import { useMemo } from "react";

function calculateStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (!password) return { score: 0, label: "" };

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
  const max = labels.length - 1;
  const clamped = Math.min(score, max);
  return { score: clamped, label: labels[clamped] };
}

const barColors = [
  "bg-red-500",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-emerald-400",
  "bg-green-500",
];

const textColors = [
  "text-red-500",
  "text-orange-400",
  "text-yellow-400",
  "text-emerald-400",
  "text-green-500",
];

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const { score, label } = useMemo(() => calculateStrength(password), [password]);

  if (!password) return null;

  const segments = 4;
  const filled = Math.min(score + 1, segments);

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1 h-1.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors duration-300 ${
              i < filled ? barColors[score] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium transition-colors duration-300 ${textColors[score]}`}>
        {label}
      </p>
    </div>
  );
};
