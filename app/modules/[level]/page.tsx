import LevelClient from './LevelClient';

export function generateStaticParams() {
  return ['1', '2', '3', '4', '5'].map((level) => ({ level }));
}

export default async function LevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  const parsedLevel = Number.parseInt(level, 10);

  return <LevelClient level={Number.isNaN(parsedLevel) ? 1 : parsedLevel} />;
}
