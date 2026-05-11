import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { certificationsApi } from '@/api/certifications';
import { useToast } from '@/hooks/use-toast';

interface DownloadReportButtonProps {
  certificationId: string;
  companyName: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function DownloadReportButton({
  certificationId,
  companyName,
  variant = 'outline',
  size = 'default',
  className = '',
}: DownloadReportButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async (language: string = 'zh') => {
    setIsDownloading(true);

    try {
      const response = await certificationsApi.downloadReport(certificationId, language);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `antigrind_certification_${companyName}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: language === 'zh' ? '下载成功' : 'Download Successful',
          description: language === 'zh'
            ? `${companyName} 的认证报告已下载`
            : `Certification report for ${companyName} has been downloaded`,
          variant: 'default',
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to download report');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: language === 'zh' ? '下载失败' : 'Download Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={() => handleDownload('zh')}
        disabled={isDownloading}
        className={className}
      >
        {isDownloading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {isDownloading ? '下载中...' : '下载报告 (中文)'}
      </Button>

      <Button
        variant="ghost"
        size={size}
        onClick={() => handleDownload('en')}
        disabled={isDownloading}
        className="text-xs"
      >
        <FileText className="mr-1 h-3 w-3" />
        EN
      </Button>
    </div>
  );
}

export default DownloadReportButton;
