const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 새로운 위스키 데이터
const newWhiskiesData = `aberfeldy-12,애버펠디 12년,/whiskies/no.pic whisky.png,애버펠디,스코틀랜드 (하이랜드),40,버번 & 셰리 캐스크,8-10만원,0,0,false
amrut-fusion,암룻 퓨전,/whiskies/no.pic whisky.png,암룻,인도,50,ex-버번 캐스크,12-15만원,0,0,false
amrut-peated,암룻 피티드,/whiskies/no.pic whisky.png,암룻,인도,46,ex-버번 캐스크,15-18만원,0,0,false
angels-envy,엔젤스 엔비,/whiskies/no.pic whisky.png,엔젤스,미국 (켄터키),43.3,포트 와인 캐스크 피니쉬,15-18만원,0,0,false
ardbeg-10,아드벡 10년,/whiskies/아드벡 10년.png,아드벡,스코틀랜드 (아일라),46,ex-버번 배럴,8-12만원,0,0,false
ardbeg-corryvreckan,아드벡 코리브렉칸,/whiskies/no.pic whisky.png,아드벡,스코틀랜드 (아일라),57.1,프렌치 오크,25-30만원,0,0,false
ardbeg-wee-beastie,아드벡 위 비스티,/whiskies/아드벡 위 비스티.png,아드벡,스코틀랜드 (아일라),47.4,버번 & 올로로소 셰리,8-10만원,0,0,false
arran-10,아란 10년,/whiskies/아란 10년.png,아란,스코틀랜드 (아일랜즈),46,버번 & 셰리,8-10만원,0,0,false
arran-quarter-cask,아란 쿼터 캐스크,/whiskies/no.pic whisky.png,아란,스코틀랜드 (아일랜즈),56.2,쿼터 캐스크,10-12만원,0,0,false
aultmore-12,올트모어 12년,/whiskies/no.pic whisky.png,올트모어,스코틀랜드 (스페이사이드),46,버번 캐스크,12-15만원,0,0,false
bakers-7,베이커스 7년,/whiskies/no.pic whisky.png,베이커스,미국 (켄터키),53.5,아메리칸 오크,12-15만원,0,0,false
balvenie-12-doublewood,발베니 12년 더블우드,/whiskies/발베니 12년 더블우드.png,발베니,스코틀랜드 (스페이사이드),40,버번 & 셰리,10-12만원,0,0,false
balvenie-14-caribbean-cask,발베니 14년 캐리비안 캐스크,/whiskies/no.pic whisky.png,발베니,스코틀랜드 (스페이사이드),43,캐리비안 럼 캐스크,18-20만원,0,0,false
basil-haydens,베이실 헤이든,/whiskies/no.pic whisky.png,베이실,미국 (켄터키),40,아메리칸 오크,8-10만원,0,0,false
benriach-10,벤리악 10년,/whiskies/no.pic whisky.png,벤리악,스코틀랜드 (스페이사이드),43,버번 & 셰리 & 버진 오크,8-10만원,0,0,false
benriach-12,벤리악 12년,/whiskies/no.pic whisky.png,벤리악,스코틀랜드 (스페이사이드),46,셰리 & 버번 & 포트,12-15만원,0,0,false
benromach-10,벤로막 10년,/whiskies/no.pic whisky.png,벤로막,스코틀랜드 (스페이사이드),43,버번 & 셰리,8-10만원,0,0,false
blantons-single-barrel,블랑톤 싱글 배럴,/whiskies/no.pic whisky.png,블랑톤,미국 (켄터키),46.5,아메리칸 오크,18-20만원,0,0,false
bookers,부커스,/whiskies/no.pic whisky.png,부커스,미국 (켄터키),63,아메리칸 오크,15-18만원,0,0,false
bowmore-12,보모어 12년,/whiskies/no.pic whisky.png,보모어,스코틀랜드 (아일라),40,버번 & 셰리,8-10만원,0,0,false
bowmore-15,보모어 15년,/whiskies/no.pic whisky.png,보모어,스코틀랜드 (아일라),43,버번 & 올로로소 셰리,12-15만원,0,0,false
bruichladdich-classic-laddie,브룩라디 클래식 래디,/whiskies/브룩라디 클래식 래디.png,브룩라디,스코틀랜드 (아일라),50,아메리칸 오크,8-10만원,0,0,false
buffalo-trace,버팔로 트레이스,/whiskies/버팔로 트레이스.png,버팔로,미국 (켄터키),45,아메리칸 오크,4-6만원,0,0,false
bulleit-bourbon,불렛 버번,/whiskies/no.pic whisky.png,불렛,미국 (켄터키),45,아메리칸 오크,4-6만원,0,0,false
bunnahabhain-12,부나하벤 12년,/whiskies/no.pic whisky.png,부나하벤,스코틀랜드 (아일라),46.3,버번 & 셰리,8-10만원,0,0,false
bushmills-10,부쉬밀 10년,/whiskies/no.pic whisky.png,부쉬밀,아일랜드,40,버번 & 셰리,8-10만원,0,0,false
canadian-club,캐나디안 클럽,/whiskies/no.pic whisky.png,캐나디안,캐나다,40,블렌디드,2-4만원,0,0,false
caol-ila-12,쿠일라 12년,/whiskies/no.pic whisky.png,쿠일라,스코틀랜드 (아일라),43,버번 캐스크,8-10만원,0,0,false
cardhu-12,카듀 12년,/whiskies/no.pic whisky.png,카듀,스코틀랜드 (스페이사이드),40,버번 & 셰리,8-10만원,0,0,false
chita,치타,/whiskies/no.pic whisky.png,치타,일본,43,다양한 캐스크,8-10만원,0,0,false
chivas-regal-12,시바스 리갈 12년,/whiskies/no.pic whisky.png,시바스,스코틀랜드,40,블렌디드,4-6만원,0,0,false
chivas-regal-18,시바스 리갈 18년,/whiskies/no.pic whisky.png,시바스,스코틀랜드,40,블렌디드,12-15만원,0,0,false
clynelish-14,클라이넬리쉬 14년,/whiskies/no.pic whisky.png,클라이넬리쉬,스코틀랜드 (하이랜드),46,버번 캐스크,12-15만원,0,0,false
compass-box-peated-monster,컴파스 박스 피티드 몬스터,/whiskies/no.pic whisky.png,컴파스,스코틀랜드,46,블렌디드 몰트,10-12만원,0,0,false
connemara,코네마라,/whiskies/no.pic whisky.png,코네마라,아일랜드,40,피티드,8-10만원,0,0,false
cragganmore-12,크래건모어 12년,/whiskies/no.pic whisky.png,크래건모어,스코틀랜드 (스페이사이드),40,버번 캐스크,8-10만원,0,0,false
crown-royal,크라운 로얄,/whiskies/no.pic whisky.png,크라운,캐나다,40,블렌디드,4-6만원,0,0,false
dalmore-12,달모어 12년,/whiskies/no.pic whisky.png,달모어,스코틀랜드 (하이랜드),40,버번 & 셰리,12-15만원,0,0,false
dalmore-15,달모어 15년,/whiskies/no.pic whisky.png,달모어,스코틀랜드 (하이랜드),40,다양한 셰리 캐스크,18-20만원,0,0,false
dalwhinnie-15,달위니 15년,/whiskies/no.pic whisky.png,달위니,스코틀랜드 (하이랜드),43,버번 캐스크,10-12만원,0,0,false
deanston-12,딘스톤 12년,/whiskies/no.pic whisky.png,딘스톤,스코틀랜드 (하이랜드),46.3,버번 캐스크,8-10만원,0,0,false
dewars-12,듀어스 12년,/whiskies/no.pic whisky.png,듀어스,스코틀랜드,40,블렌디드,4-6만원,0,0,false
eagle-rare-10,이글 레어 10년,/whiskies/no.pic whisky.png,이글,미국 (켄터키),45,아메리칸 오크,8-10만원,0,0,false
elijah-craig-small-batch,일라이저 크레이그 스몰 배치,/whiskies/no.pic whisky.png,일라이저,미국 (켄터키),47,아메리칸 오크,8-10만원,0,0,false
famous-grouse,페이머스 그라우스,/whiskies/no.pic whisky.png,페이머스,스코틀랜드,40,블렌디드,2-4만원,0,0,false
four-roses-single-barrel,포 로지스 싱글 배럴,/whiskies/no.pic whisky.png,포,미국 (켄터키),50,아메리칸 오크,8-10만원,0,0,false
gentleman-jack,젠틀맨 잭,/whiskies/no.pic whisky.png,잭다니엘,미국 (테네시),40,차콜 멜로우잉,4-6만원,0,0,false
glenallachie-12,글렌알라키 12년,/whiskies/글렌알라키 12년.png,글렌알라키,스코틀랜드 (스페이사이드),46,셰리 & 버진 오크,10-12만원,0,0,false
glenallachie-15,글렌알라키 15년,/whiskies/no.pic whisky.png,글렌알라키,스코틀랜드 (스페이사이드),46,PX & 올로로소 셰리,15-18만원,0,0,false
glencadam-10,글렌카담 10년,/whiskies/no.pic whisky.png,글렌카담,스코틀랜드 (하이랜드),46,버번 캐스크,8-10만원,0,0,false
glendronach-12,글렌드로낙 12년,/whiskies/no.pic whisky.png,글렌드로낙,스코틀랜드 (하이랜드),43,PX & 올로로소 셰리,10-12만원,0,0,false
glenfarclas-105,글렌파클라스 105,/whiskies/no.pic whisky.png,글렌파클라스,스코틀랜드 (스페이사이드),60,셰리 캐스크,12-15만원,0,0,false
glenfiddich-12,글렌피딕 12년,/whiskies/글렌피딕 12년.png,글렌피딕,스코틀랜드 (스페이사이드),40,버번 & 셰리,8-10만원,0,0,false
glenfiddich-15,글렌피딕 15년,/whiskies/no.pic whisky.png,글렌피딕,스코틀랜드 (스페이사이드),40,솔레라 시스템,12-15만원,0,0,false
glenfiddich-18,글렌피딕 18년,/whiskies/no.pic whisky.png,글렌피딕,스코틀랜드 (스페이사이드),40,셰리 & 버번,18-20만원,0,0,false
glen-grant-10,글렌 그란트 10년,/whiskies/no.pic whisky.png,글렌,스코틀랜드 (스페이사이드),40,버번 캐스크,8-10만원,0,0,false
glenkinchie-12,글렌킨치 12년,/whiskies/no.pic whisky.png,글렌킨치,스코틀랜드 (로우랜드),43,버번 캐스크,8-10만원,0,0,false
glenlivet-12,글렌리벳 12년,/whiskies/no.pic whisky.png,글렌리벳,스코틀랜드 (스페이사이드),40,버번 & 유러피안 오크,8-10만원,0,0,false
glenlivet-15,글렌리벳 15년,/whiskies/no.pic whisky.png,글렌리벳,스코틀랜드 (스페이사이드),40,프렌치 오크,12-15만원,0,0,false
glenmorangie-10-the-original,글렌모렌지 10년 오리지널,/whiskies/글렌모렌지 10년.png,글렌모렌지,스코틀랜드 (하이랜드),40,버번 캐스크,8-10만원,0,0,false
glenmorangie-quinta-ruban-14,글렌모렌지 퀸타 루반 14년,/whiskies/no.pic whisky.png,글렌모렌지,스코틀랜드 (하이랜드),46,포트 캐스크,10-12만원,0,0,false
glenrothes-12,글렌로티스 12년,/whiskies/no.pic whisky.png,글렌로티스,스코틀랜드 (스페이사이드),40,셰리 캐스크,10-12만원,0,0,false
glenscotia-victoriana,글렌스코시아 빅토리아나,/whiskies/no.pic whisky.png,글렌스코시아,스코틀랜드 (캠벨타운),54.2,딥 차 오크,15-18만원,0,0,false
green-spot,그린 스팟,/whiskies/no.pic whisky.png,그린,아일랜드,40,버번 & 셰리,10-12만원,0,0,false
hakushu-distillers-reserve,하쿠슈 디스틸러스 리저브,/whiskies/no.pic whisky.png,하쿠슈,일본,43,다양한 캐스크,12-15만원,0,0,false
hazelburn-10,헤이즐번 10년,/whiskies/no.pic whisky.png,헤이즐번,스코틀랜드 (캠벨타운),46,버번 캐스크,12-15만원,0,0,false
hibiki-harmony,히비키 하모니,/whiskies/히비키 하모니.png,히비키,일본,43,블렌디드,15-18만원,0,0,false
highland-park-12,하이랜드 파크 12년,/whiskies/no.pic whisky.png,하이랜드,스코틀랜드 (아일랜즈),40,셰리 캐스크,8-10만원,0,0,false
hinch-5-double-wood,힌치 5년 더블우드,/whiskies/no.pic whisky.png,힌치,아일랜드,43,버번 & 버진 오크,6-8만원,0,0,false
hinch-peated-single-malt,힌치 피티드 싱글몰트,/whiskies/no.pic whisky.png,힌치,아일랜드,43,피티드,8-10만원,0,0,false
hinch-small-batch-bourbon-cask,힌치 스몰배치 버번 캐스크,/whiskies/no.pic whisky.png,힌치,아일랜드,43,버번 캐스크,4-6만원,0,0,false
hudson-baby-bourbon,허드슨 베이비 버번,/whiskies/no.pic whisky.png,허드슨,미국 (뉴욕),46,아메리칸 오크,10-12만원,0,0,false
inchmurrin-12,인치머린 12년,/whiskies/no.pic whisky.png,인치머린,스코틀랜드 (하이랜드),46,버번 & 리필 & 리차,8-10만원,0,0,false
jack-daniels-old-no7,잭 다니엘 올드 넘버 7,/whiskies/잭 다니엘.png,잭다니엘,미국 (테네시),40,차콜 멜로우잉,4-6만원,0,0,false
jameson,제임슨,/whiskies/no.pic whisky.png,제임슨,아일랜드,40,블렌디드,2-4만원,0,0,false
jims-korean-whisky-batch1,김창수 위스키 배치 1,/whiskies/no.pic whisky.png,김창수,한국,50,버진 오크,20-25만원,0,0,false
jims-korean-whisky-batch2,김창수 위스키 배치 2,/whiskies/no.pic whisky.png,김창수,한국,51,버진 오크,20-25만원,0,0,false
johnnie-walker-black-label,조니 워커 블랙 라벨,/whiskies/no.pic whisky.png,조니워커,스코틀랜드,40,블렌디드,4-6만원,0,0,false
johnnie-walker-blue-label,조니 워커 블루 라벨,/whiskies/no.pic whisky.png,조니워커,스코틀랜드,40,블렌디드,25-30만원,0,0,false
johnnie-walker-double-black,조니 워커 더블 블랙,/whiskies/no.pic whisky.png,조니워커,스코틀랜드,40,블렌디드,6-8만원,0,0,false
johnnie-walker-green-label,조니 워커 그린 라벨,/whiskies/no.pic whisky.png,조니워커,스코틀랜드,43,블렌디드 몰트,8-10만원,0,0,false
jura-10,주라 10년,/whiskies/no.pic whisky.png,주라,스코틀랜드 (아일랜즈),40,버번 & 셰리,8-10만원,0,0,false
kavalan-concertmaster,카발란 콘서트마스터,/whiskies/no.pic whisky.png,카발란,대만,40,포트 캐스크,12-15만원,0,0,false
kavalan-distillery-select,카발란 디스틸러리 셀렉트,/whiskies/no.pic whisky.png,카발란,대만,40,다양한 캐스크,10-12만원,0,0,false
kilbeggan,킬베간,/whiskies/no.pic whisky.png,킬베간,아일랜드,40,블렌디드,4-6만원,0,0,false
kilchoman-machir-bay,킬호만 마키어 베이,/whiskies/no.pic whisky.png,킬호만,스코틀랜드 (아일라),46,버번 & 셰리,10-12만원,0,0,false
kilchoman-sanaig,킬호만 사닉,/whiskies/no.pic whisky.png,킬호만,스코틀랜드 (아일라),46,버번 & 올로로소 셰리,12-15만원,0,0,false
kilkerran-12,킬커란 12년,/whiskies/no.pic whisky.png,킬커란,스코틀랜드 (캠벨타운),46,버번 & 셰리,12-15만원,0,0,false
knob-creek-9,놉 크릭 9년,/whiskies/no.pic whisky.png,놉,미국 (켄터키),50,아메리칸 오크,8-10만원,0,0,false
lagavulin-16,라가불린 16년,/whiskies/no.pic whisky.png,라가불린,스코틀랜드 (아일라),43,버번 & 셰리,15-18만원,0,0,false
laphroaig-10,라프로익 10년,/whiskies/라프로익 10년.png,라프로익,스코틀랜드 (아일라),40,버번 캐스크,8-10만원,0,0,false
laphroaig-10-cask-strength,라프로익 10년 캐스크 스트렝스,/whiskies/no.pic whisky.png,라프로익,스코틀랜드 (아일라),58.6,버번 캐스크,15-18만원,0,0,false
laphroaig-quarter-cask,라프로익 쿼터 캐스크,/whiskies/no.pic whisky.png,라프로익,스코틀랜드 (아일라),48,쿼터 캐스크,10-12만원,0,0,false
leblon-cachaca,레블론 카샤사,/whiskies/no.pic whisky.png,레블론,브라질,40,카샤사,4-6만원,0,0,false
ledaig-10,레칙 10년,/whiskies/no.pic whisky.png,레칙,스코틀랜드 (아일랜즈),46.3,버번 캐스크,8-10만원,0,0,false
linkwood-12,링크우드 12년,/whiskies/no.pic whisky.png,링크우드,스코틀랜드 (스페이사이드),43,버번 캐스크,10-12만원,0,0,false
loch-lomond-12,로크로몬드 12년,/whiskies/no.pic whisky.png,로크로몬드,스코틀랜드 (하이랜드),46,버번 & 리필 & 리차,8-10만원,0,0,false
longmorn-distillers-choice,롱몬 디스틸러스 초이스,/whiskies/no.pic whisky.png,롱몬,스코틀랜드 (스페이사이드),40,호그스헤드 & 셰리 & 버번,10-12만원,0,0,false
longrow-peated,롱로우 피티드,/whiskies/no.pic whisky.png,롱로우,스코틀랜드 (캠벨타운),46,버번 & 셰리,10-12만원,0,0,false
macallan-12-sherry-oak,맥캘란 12년 셰리 오크,/whiskies/no.pic whisky.png,맥캘란,스코틀랜드 (스페이사이드),40,셰리 캐스크,12-15만원,0,0,false
makers-mark,메이커스 마크,/whiskies/메이커스 마크.png,메이커스,미국 (켄터키),45,아메리칸 오크,4-6만원,0,0,false
michter-s-us1-bourbon,믹터스 US1 버번,/whiskies/no.pic whisky.png,믹터스,미국 (켄터키),45.7,아메리칸 오크,10-12만원,0,0,false
miyagikyo-single-malt,미야기쿄 싱글몰트,/whiskies/no.pic whisky.png,미야기쿄,일본,45,다양한 캐스크,12-15만원,0,0,false
monkey-shoulder,몽키 숄더,/whiskies/몽키 숄더.png,몽키,스코틀랜드,40,블렌디드 몰트,4-6만원,0,0,false
mortlach-12,몰트락 12년,/whiskies/no.pic whisky.png,몰트락,스코틀랜드 (스페이사이드),43.4,버번 & 셰리,12-15만원,0,0,false
mortlach-16,몰트락 16년,/whiskies/no.pic whisky.png,몰트락,스코틀랜드 (스페이사이드),43.4,셰리 캐스크,18-20만원,0,0,false
nikka-from-the-barrel,니카 프롬 더 배럴,/whiskies/no.pic whisky.png,니카,일본,51.4,블렌디드,8-10만원,0,0,false
oban-14,오반 14년,/whiskies/no.pic whisky.png,오반,스코틀랜드 (하이랜드),43,버번 캐스크,12-15만원,0,0,false
old-ezra-7,올드 에즈라 7년,/whiskies/no.pic whisky.png,올드,미국 (켄터키),58.5,아메리칸 오크,12-15만원,0,0,false
old-forester-1920,올드 포레스터 1920,/whiskies/no.pic whisky.png,올드,미국 (켄터키),57.5,아메리칸 오크,12-15만원,0,0,false
old-pulteney-12,올드 풀트니 12년,/whiskies/no.pic whisky.png,올드,스코틀랜드 (하이랜드),40,버번 캐스크,8-10만원,0,0,false
penderyn-myth,펜더린 미스,/whiskies/no.pic whisky.png,펜더린,웨일스,41,버번 & 레드와인,10-12만원,0,0,false
pikesville-rye,파이크스빌 라이,/whiskies/no.pic whisky.png,파이크스빌,미국 (켄터키),55,라이,12-15만원,0,0,false
port-charlotte-10,포트샬롯 10년,/whiskies/no.pic whisky.png,포트샬롯,스코틀랜드 (아일라),50,아메리칸 & 프렌치 오크,12-15만원,0,0,false
powers-gold-label,파워스 골드 라벨,/whiskies/no.pic whisky.png,파워스,아일랜드,40,블렌디드,4-6만원,0,0,false
redbreast-12,레드브레스트 12년,/whiskies/no.pic whisky.png,레드브레스트,아일랜드,40,버번 & 셰리,10-12만원,0,0,false
rittenhouse-rye,리튼하우스 라이,/whiskies/no.pic whisky.png,리튼하우스,미국 (켄터키),50,라이,8-10만원,0,0,false
royal-salute-21,로얄 살루트 21년,/whiskies/no.pic whisky.png,로얄,스코틀랜드,40,블렌디드,20-25만원,0,0,false
russells-reserve-10,러셀 리저브 10년,/whiskies/no.pic whisky.png,러셀,미국 (켄터키),45,아메리칸 오크,8-10만원,0,0,false
sazerac-rye,사제락 라이,/whiskies/no.pic whisky.png,사제락,미국 (켄터키),45,라이,8-10만원,0,0,false
scapa-skiren,스카파 스키렌,/whiskies/no.pic whisky.png,스카파,스코틀랜드 (아일랜즈),40,버번 캐스크,8-10만원,0,0,false
singleton-12-of-dufftown,싱글톤 12년 더프타운,/whiskies/no.pic whisky.png,싱글톤,스코틀랜드 (스페이사이드),40,버번 & 셰리,8-10만원,0,0,false
slane,슬레인,/whiskies/no.pic whisky.png,슬레인,아일랜드,40,트리플 캐스크,4-6만원,0,0,false
smokehead,스모크헤드,/whiskies/no.pic whisky.png,스모크헤드,스코틀랜드 (아일라),43,버번 캐스크,8-10만원,0,0,false
southern-comfort,서던 컴포트,/whiskies/no.pic whisky.png,서던,미국 (루이지애나),35,리큐르,2-4만원,0,0,false
springbank-10,스프링뱅크 10년,/whiskies/no.pic whisky.png,스프링뱅크,스코틀랜드 (캠벨타운),46,버번 & 셰리,15-18만원,0,0,false
springbank-15,스프링뱅크 15년,/whiskies/no.pic whisky.png,스프링뱅크,스코틀랜드 (캠벨타운),46,셰리 캐스크,25-30만원,0,0,false
st-remy-vsop,생레미 VSOP,/whiskies/no.pic whisky.png,생레미,프랑스,40,브랜디,2-4만원,0,0,false
strathisla-12,스트라스아일라 12년,/whiskies/no.pic whisky.png,스트라스아일라,스코틀랜드 (스페이사이드),40,버번 캐스크,10-12만원,0,0,false
talisker-10,탈리스커 10년,/whiskies/탈리스커 10년.png,탈리스커,스코틀랜드 (아일랜즈),45.8,버번 캐스크,8-10만원,0,0,false
talisker-storm,탈리스커 스톰,/whiskies/no.pic whisky.png,탈리스커,스코틀랜드 (아일랜즈),45.8,리필 & 리차 캐스크,10-12만원,0,0,false
tamdhu-12,탐두 12년,/whiskies/no.pic whisky.png,탐두,스코틀랜드 (스페이사이드),43,셰리 캐스크,10-12만원,0,0,false
teeling-small-batch,틸링 스몰 배치,/whiskies/no.pic whisky.png,틸링,아일랜드,46,럼 캐스크 피니쉬,8-10만원,0,0,false
the-h-whisky,더 에이치 위스키,/whiskies/no.pic whisky.png,더에이치,한국,40,블렌디드,2-4만원,0,0,false
thomson-manuka,톰슨 마누카 스모크,/whiskies/no.pic whisky.png,톰슨,뉴질랜드,46,버번 캐스크,25-30만원,0,0,false
three-ships-10,쓰리 쉽스 10년,/whiskies/no.pic whisky.png,쓰리,남아프리카,43,아메리칸 오크,15-18만원,0,0,false
three-societies,쓰리 소사이어티스,/whiskies/no.pic whisky.png,쓰리,한국,43,아메리칸 오크,25-30만원,0,0,false
tullamore-dew,털라모어 듀,/whiskies/no.pic whisky.png,털라모어,아일랜드,40,3 캐스크 블렌드,4-6만원,0,0,false
white-oak-akashi,화이트 오크 아카시,/whiskies/no.pic whisky.png,화이트,일본,40,버번 & 셰리 캐스크,10-12만원,0,0,false
wild-turkey-101,와일드 터키 101,/whiskies/와일드 터키 101.png,와일드,미국 (켄터키),50.5,아메리칸 오크,4-6만원,0,0,false
wild-turkey-longbranch,와일드 터키 롱브랜치,/whiskies/no.pic whisky.png,와일드,미국 (켄터키),43,차콜 필터링,8-10만원,0,0,false
wild-turkey-rye,와일드 터키 라이,/whiskies/no.pic whisky.png,와일드,미국 (켄터키),40.5,라이,4-6만원,0,0,false
woodford-reserve,우드포드 리저브,/whiskies/우드포드 리저브.png,우드포드,미국 (켄터키),43.2,아메리칸 오크,8-10만원,0,0,false
yamazaki-distillers-reserve,야마자키 디스틸러스 리저브,/whiskies/no.pic whisky.png,야마자키,일본,43,다양한 캐스크,12-15만원,0,0,false
yellow-spot-12,옐로우 스팟 12년,/whiskies/no.pic whisky.png,옐로우,아일랜드,46,버번 & 셰리 & 말라가,15-18만원,0,0,false
yoichi-single-malt,요이치 싱글몰트,/whiskies/no.pic whisky.png,요이치,일본,45,다양한 캐스크,12-15만원,0,0,false`;

async function addNewWhiskies() {
  try {
    console.log('🚀 새로운 위스키 데이터 추가 작업 시작...');

    // 1. 기존 위스키 ID 목록 가져오기
    console.log('1️⃣ 기존 위스키 목록을 확인하는 중...');
    const { data: existingWhiskies, error: fetchError } = await supabase
      .from('whiskies')
      .select('id');

    if (fetchError) {
      console.error('❌ 기존 위스키 목록을 가져오는데 실패했습니다:', fetchError.message);
      return;
    }

    const existingIds = new Set(existingWhiskies.map(w => w.id));
    console.log(`✅ 기존 위스키 ${existingIds.size}개 확인완료`);

    // 2. 새로운 위스키 데이터 파싱
    console.log('2️⃣ 새로운 위스키 데이터를 파싱하는 중...');
    const lines = newWhiskiesData.trim().split('\n');
    const newWhiskies = [];

    for (const line of lines) {
      const [id, name, image, distillery, region, abv, cask, price, avg_rating, likes, is_featured] = line.split(',');

      // 중복 체크
      if (!existingIds.has(id)) {
        newWhiskies.push({
          id,
          name,
          image,
          distillery,
          region,
          abv: parseFloat(abv),
          cask,
          price,
          avg_rating: parseFloat(avg_rating),
          likes: parseInt(likes),
          is_featured: is_featured === 'true'
        });
      }
    }

    console.log(`✅ 새로운 위스키 ${newWhiskies.length}개 파싱 완료`);
    console.log(`⚠️  중복 제외된 위스키 ${lines.length - newWhiskies.length}개`);

    if (newWhiskies.length === 0) {
      console.log('🎉 추가할 새로운 위스키가 없습니다.');
      return;
    }

    // 3. 배치로 데이터베이스에 추가
    console.log('3️⃣ 데이터베이스에 새로운 위스키를 추가하는 중...');
    const batchSize = 50;
    let addedCount = 0;

    for (let i = 0; i < newWhiskies.length; i += batchSize) {
      const batch = newWhiskies.slice(i, i + batchSize);

      const { error: insertError } = await supabase
        .from('whiskies')
        .insert(batch);

      if (insertError) {
        console.error(`❌ 배치 ${Math.floor(i/batchSize) + 1} 추가 실패:`, insertError.message);
        continue;
      }

      addedCount += batch.length;
      console.log(`✅ 배치 ${Math.floor(i/batchSize) + 1} 완료: ${batch.length}개 추가 (총 ${addedCount}/${newWhiskies.length})`);
    }

    console.log('🎉 위스키 추가 작업 완료!');
    console.log('============================================================');
    console.log(`✅ 성공적으로 추가된 위스키: ${addedCount}개`);
    console.log(`⚠️  중복으로 제외된 위스키: ${lines.length - newWhiskies.length}개`);
    console.log(`📊 총 처리된 위스키: ${lines.length}개`);
    console.log('============================================================');

  } catch (error) {
    console.error('❌ 작업 중 오류가 발생했습니다:', error.message);
  }
}

addNewWhiskies();