'use client';

import { useTranslations } from 'next-intl';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Copy, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function InviteShareOptions({ inviteCode, familyId }: { inviteCode: string | null, familyId: string }) {
  const t = useTranslations('invite');
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const inviteUrl = inviteCode && origin ? `${origin}/join/${inviteCode}` : '';

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!inviteUrl) return;
    const text = encodeURIComponent(`Join our family tree on Our Family! Click here: ${inviteUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (!inviteUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Our Family Tree',
          text: 'Join our family tree on Our Family!',
          url: inviteUrl,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-3 bg-slate-50 border rounded-lg break-all text-sm font-medium text-slate-700 flex items-center justify-between gap-2">
        <span className="truncate flex-1 text-left">{inviteUrl || 'Generating...'}</span>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleCopy}
          disabled={!inviteUrl}
          className="shrink-0 h-8 w-8"
        >
          {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
        </Button>
      </div>

      <div className="space-y-3 pt-2">
        <Button 
          className="w-full h-14 text-lg font-semibold bg-[#25D366] hover:bg-[#128C7E] text-white"
          onClick={handleWhatsAppShare}
          disabled={!inviteUrl}
        >
          <Share2 className="mr-2 h-5 w-5" />
          {t('shareWhatsappBtn')}
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-12 border-slate-200"
            onClick={handleNativeShare}
            disabled={!inviteUrl}
          >
            Share
          </Button>
          <Link 
            href={`/family/${familyId}`}
            className={cn(buttonVariants({ variant: "outline" }), "h-12 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100")}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
