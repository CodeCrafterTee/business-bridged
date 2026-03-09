import Card from "../../components/common/Card";
import Progress from "../../components/common/Progress";

export default function ScoreExplanation() {
  const score = 74;

  const breakdown = [
    { label: "Profile completeness", value: 80 },
    { label: "Documents", value: 50 },
    { label: "Mentorship", value: 30 },
    { label: "Compliance", value: 90 },
  ];

  return (
    <div className="space-y-4">

      <Card>
        <h1 className="text-xl font-bold">Score explanation</h1>
        <p className="text-sm text-white/60 mt-1">
          Your business score represents how ready your business
          profile is for funding and support.
        </p>
      </Card>

      <Card>
        <div className="text-xs text-white/60">Current score</div>
        <div className="text-5xl font-extrabold mt-1">{score}</div>
      </Card>

      <Card>
        <div className="text-sm font-semibold mb-3">Score breakdown</div>

        <div className="space-y-4">
          {breakdown.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>

              <Progress value={item.value} />
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}