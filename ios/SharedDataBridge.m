#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SharedDataBridge, NSObject)

RCT_EXTERN_METHOD(writeTimerState:(NSDictionary *)data)

@end
