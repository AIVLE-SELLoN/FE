export interface ChannelComparisonItem {
  usersChannelKey: number;
  channelType: string; // "COUPANG" | "NAVER" | "ZIGZAG"
  totalInquiryCount: number;
  totalInquiryChangeRate: number;
  totalInquiryComment: string;
  inquiryRatePerOrder: number;
  inquiryRateComment: string;
  avgRating: number;
  avgRatingComment: string;
  reviewRatePerOrder: number;
  reviewRateComment: string;
  positiveRatio: number;
  neutralRatio: number;
  negativeRatio: number;
  sentimentComment: string;
  aspectComment: string;
}

export interface ChannelInquiryTypeItem {
  inquireType: string; // "색상" | "사이즈" | "소재" | "파손" | "오배송" | "기타"
  inquiryCount: number;
  ratio: number;
}

export interface ChannelInquiryTypeRadarItem {
  usersChannelKey: number;
  channelType: string;
  distribution: ChannelInquiryTypeItem[];
}

export interface ChannelMonthlyItem {
  yearMonth: string; // "2026-01"
  inquiryCount: number;
}

export interface ChannelInsightItem {
  content: string;
}