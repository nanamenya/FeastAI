import React from 'react';
import { useStore } from '../store/useStore';
import { Share2, Printer, Download } from 'lucide-react';
import domtoimage from 'dom-to-image-more';

export const ShareButton: React.FC = () => {
    const { currentSchedule } = useStore();

    const captureSchedule = async (): Promise<Blob | null> => {
        console.log('captureSchedule called');
        const scheduleElement = document.querySelector('[data-schedule-grid]') as HTMLElement;
        console.log('scheduleElement:', scheduleElement);

        if (!scheduleElement) {
            console.error('Schedule grid not found');
            alert('Schedule grid not found. Please make sure you have generated a schedule first.');
            return null;
        }

        try {
            console.log('Attempting to capture with dom-to-image...');
            const dataUrl = await domtoimage.toBlob(scheduleElement, {
                bgcolor: '#ffffff',
                quality: 1.0,
            });

            console.log('Blob created:', dataUrl);
            return dataUrl;
        } catch (error) {
            console.error('Error capturing schedule:', error);
            alert(`Error capturing schedule: ${error}`);
            return null;
        }
    };

    const handleDownload = async () => {
        console.log('handleDownload clicked');
        try {
            const blob = await captureSchedule();
            if (!blob) {
                console.error('No blob returned');
                return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `feast-ai-schedule-${new Date().toISOString().split('T')[0]}.png`;
            link.click();
            URL.revokeObjectURL(url);
            console.log('Download initiated');
        } catch (error) {
            console.error('Download error:', error);
            alert(`Download failed: ${error}`);
        }
    };

    const handlePrint = async () => {
        const blob = await captureSchedule();
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
                URL.revokeObjectURL(url);
            };
        }
    };

    const handleShare = async () => {
        if (!currentSchedule) return;

        const blob = await captureSchedule();
        if (!blob) return;

        const file = new File([blob], 'feast-ai-schedule.png', { type: 'image/png' });

        // Try native share API first (works on mobile)
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
            try {
                await navigator.share({
                    title: 'Feast.ai Cooking Schedule',
                    text: `Cooking schedule for ${currentSchedule.recipes.length} dishes`,
                    files: [file],
                });
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error('Error sharing:', err);
                    // Fallback to download
                    handleDownload();
                }
            }
        } else {
            // Fallback to download
            handleDownload();
        }
    };

    if (!currentSchedule) return null;

    return (
        <div className="flex justify-center gap-3 flex-wrap">
            <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm text-sm md:text-base"
            >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
                <span>Download</span>
            </button>

            <button
                onClick={handlePrint}
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
