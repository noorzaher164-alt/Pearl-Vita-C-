import { redirect } from 'next/navigation';

/** Deep link from a member profile — the award form lives on the points page. */
export default async function NewPointsPage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string }>;
}) {
  const params = await searchParams;
  redirect(params.member ? `/portal/points?member=${params.member}` : '/portal/points');
}
