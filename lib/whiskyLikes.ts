import { supabase } from './supabase';

// 특정 위스키가 현재 사용자에 의해 찜되었는지 확인
export async function isWhiskyLiked(whiskyId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('whisky_id', whiskyId)
      .limit(1);

    if (error) {
      console.error('찜 상태 확인 중 오류:', error);
      return false;
    }
    return data.length > 0;
  } catch (error) {
    console.error('찜 상태 확인 중 예외 발생:', error);
    return false;
  }
}

// 위스키 찜하기
export async function addWhiskyLike(whiskyId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('찜하기 실패: 로그인이 필요합니다.');
      return false;
    }

    const { error } = await supabase
      .from('likes')
      .insert({ user_id: user.id, whisky_id: whiskyId });

    if (error) {
      console.error('찜하기 실패:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('찜하기 중 예외 발생:', error);
    return false;
  }
}

// 위스키 찜 취소하기
export async function removeWhiskyLike(whiskyId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('찜 취소 실패: 로그인이 필요합니다.');
      return false;
    }

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('whisky_id', whiskyId);

    if (error) {
      console.error('찜 취소 실패:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('찜 취소 중 예외 발생:', error);
    return false;
  }
}

// 내가 찜한 모든 위스키 ID 목록 가져오기
export async function getUserWhiskyLikes(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('whisky_likes')
      .select('whisky_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('찜 목록 조회 중 오류:', error);
      return [];
    }

    // data는 [{ whisky_id: '...' }, { whisky_id: '...' }] 형태이므로, id만 추출하여 배열로 반환
    return data.map(like => like.whisky_id);
  } catch (error) {
    console.error('찜 목록 조회 중 예외 발생:', error);
    return [];
  }
}