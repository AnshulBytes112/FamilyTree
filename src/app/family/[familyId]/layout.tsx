import { ReactNode } from 'react';
import { AppSidebar } from '@/components/app-shell/AppSidebar';

export default async function FamilyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ familyId: string }>;
}) {
  const resolvedParams = await params;
  
  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] bg-[#FAFAF7] w-full max-w-[100vw] overflow-x-hidden">
      <AppSidebar familyId={resolvedParams.familyId} />
      <main className="flex-1 w-full min-w-0 md:h-screen md:overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
