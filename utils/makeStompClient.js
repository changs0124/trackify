import { Client } from "@stomp/stompjs";
import { TIMING } from "constants/stompConstants";

// STOMP Client 생성 유틸
// - STOMP 옵션을 한곳에서 통일 관리
// - 다시 생성/교체가 쉬워지고, 테스트시 목 객체로 대체하기 용이

// url: 웹소켓 엔드포인트(쿼리스트링 포함 > Principal에 넣어서 자기 자신을 제외한 구독자들한테 메시지 전송)
// Client: 설정된 STOMP Client 인스턴스
export const makeStompClient = (url) => {
    return new Client({
        webSocketFactory: () => new WebSocket(url, ['v12.stomp', 'v11.stomp']), // RN/웹에서 호환성을 위해 서브프로토콜 명시
        forceBinaryWSFrames: true, // 텍스트 대신 바이너리 프레임 사용(성능/호환 고려)
        appendMissingNULLonIncoming: true, // 누락된 NULL 종료문자 자동 보완(일부 브로커/프록시 호환성)
        connectHeaders: { host: 'renat-local' }, // Spring STOMP에서 host 헤더를 요구하는 구성이 있을 수 있어 기본값 제공
        
        // 재연결/하트비트 정책(constants에서 관리)
        reconnectDelay: TIMING.reconnectDelay,
        heartbeatIncoming: TIMING.heartbeatIncoming,
        heartbeatOutgoing: TIMING.heartbeatOutgoing,
        
        // 디버깅/에러 로깅
        debug: (msg) => console.log('[STOMP]', msg),
        onWebSocketError: (e) => console.warn('[WS ERROR]', e?.message || e),
        onStompError: (f) => console.warn('[STOMP ERROR]', f?.headers, f?.body),
    });
}