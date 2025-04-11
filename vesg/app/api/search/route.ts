// app/api/search/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { part, process } = body;

  console.log('API received:', part, process);

  const response = [
    {
      title: 'Tab 1',
      nodes: [
        { id: '1', position: { x: 0, y: 50 }, data: { label: 'Node A', process: 'P a', parts: 'Parts A' }, type: 'eventNode' },
        { id: '2', position: { x: 150, y: 50 }, data: { label: 'Node B' }, type: 'eventNode' },
        { id: '3', position: { x: 300, y: 50 }, data: { label: 'Node C' }, type: 'eventNode' }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', label: 'A->B' },
        { id: 'e2-3', source: '2', target: '3', label: 'B->C' }
      ]
    },
    {
      title: 'Tab 2',
      nodes: [
        { id: 'n1', data: { label: 'Start' } },
        { id: 'n2', data: { label: 'Middle' } },
        { id: 'n3', data: { label: 'End' } },
        { id: 'n4', data: { label: 'End2' } }
      ],
      edges: [
        { id: 'n1-n2', source: 'n1', target: 'n2', label: 'Start->Middle' },
        { id: 'n2-n3', source: 'n2', target: 'n3', label: 'Middle->End' },
        { id: 'n2-n4', source: 'n2', target: 'n4', }
      ]
    },
    {
      title: 'Tab 3',
      nodes: [
        { id: 'A', position: { x: 0, y: 0 }, data: { label: 'Alpha' } },
        { id: 'B', position: { x: 100, y: 100 }, data: { label: 'Beta' } },
        { id: 'C', position: { x: 200, y: 0 }, data: { label: 'Gamma' } }
      ],
      edges: [
        { id: 'A-B', source: 'A', target: 'B', label: 'Alpha->Beta' },
        { id: 'B-C', source: 'B', target: 'C', label: 'Beta->Gamma' }
      ]
    }
  ];

  return NextResponse.json(response);
}
