import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 모든 위스키를 가져옴 (초기 20개 이후의 나머지), 이미지 있는 것 우선
    const { data, error } = await supabase
      .from('whiskies')
      .select('id, name, image, abv, region, price, cask, avg_rating, likes')
      .order('image', { ascending: false }) // Supabase Storage 이미지 우선
      .order('name', { ascending: true })
      .range(20, 1000); // 21번째부터 모든 위스키 가져오기

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}