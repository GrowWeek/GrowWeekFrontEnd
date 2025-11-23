'use client';

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export function RetrospectiveDashboard() {
  const router = useRouter();

  // TODO: Fetch week status from API
  // For now, assume review is not completed as we focus on Task API integration
  const isReviewCompleted = false; 
  const currentWeekId = 0; // Placeholder

  const handleStartReview = () => {
    // In a real app, this would navigate to the review flow wizard.
    // For this MVP step, we will just simulate "Completing" the review immediately or show a confirmation.
    
    // Simulating review completion:
    if (confirm("회고를 완료하시겠습니까? 완료하면 이번 주 할일 목록이 잠금(Lock) 처리됩니다.")) {
        // completeReview(currentWeekId); // TODO: Call API to complete review
        // Optionally redirect or show success message
        alert("회고 기능은 아직 API가 준비되지 않았습니다.");
        // router.push("/"); 
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">주간 회고</h2>
        <p className="text-muted-foreground text-gray-500">
          이번 주 업무를 돌아보고 성장을 기록하는 시간입니다.
        </p>
      </div>

      <Card className="p-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[300px]">
        {isReviewCompleted ? (
            <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Lock className="w-8 h-8 text-green-600" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-2">이번 주 회고 완료!</h3>
                    <p className="text-gray-500 max-w-md">
                        이번 주 회고가 성공적으로 저장되었습니다. <br/>
                        할일 목록이 읽기 전용으로 변경되었습니다.
                    </p>
                </div>
                <Button variant="secondary" disabled>회고 수정하기 (준비중)</Button>
            </>
        ) : (
            <>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">아직 회고를 진행하지 않았습니다</h3>
                    <p className="text-gray-500">
                        금요일입니다! 이번 주를 마무리하며 회고를 진행해보세요.
                    </p>
                </div>
                <Button size="lg" className="w-full max-w-xs" onClick={handleStartReview}>
                    회고 시작하기
                </Button>
            </>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
         <Card className="p-6">
            <h4 className="font-semibold mb-2">지난 회고 히스토리</h4>
            <p className="text-sm text-gray-500">아직 작성된 지난 회고가 없습니다.</p>
         </Card>
         <Card className="p-6">
            <h4 className="font-semibold mb-2">이번 달 성장 요약</h4>
             <p className="text-sm text-gray-500">회고 데이터가 쌓이면 통계가 표시됩니다.</p>
         </Card>
      </div>
    </div>
  );
}
