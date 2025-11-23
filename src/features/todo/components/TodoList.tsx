export function TodoList() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">오늘의 할일</h2>
      <div className="border rounded p-4 shadow-sm">
        <p className="text-gray-500">할일이 없습니다.</p>
      </div>
    </div>
  );
}

