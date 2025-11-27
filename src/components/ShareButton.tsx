import React from 'react';
import { useStore } from '../store/useStore';
import { Share2, Printer } from 'lucide-react';

export const ShareButton: React.FC = () => {
    const { currentSchedule } = useStore();

    const handleShare = async () => {
        if (!currentSchedule) return;

        const shareData = {
            title: 'FeastAI Cooking Schedule',
            text: `Cooking schedule for ${currentSchedule.recipes.length} dishes`,
            url: window.location.href,
        };

        // Try native share API first (works on mobile)
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            // Fallback to print
            window.print();
        }
    };

    if (!currentSchedule) return null;

    return (
        <div className="flex justify-center gap-3">
            <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium shadow-sm text-sm md:text-base"
            >
                <Printer className="w-4 h-4 md:w-5 md:h-5" />
                <span>Print</span>
            </button>

            <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm text-sm md:text-base"
            >
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                <span>Share</span>
            </button>
        </div>
    );
};
