"use client"
import Sidebar from '@/component/Sidebar';
import SearchArea from '@/component/SearchArea';

export default function Home() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '20px' }}>
        <SearchArea />
      </main>
    </div>
  );
}
