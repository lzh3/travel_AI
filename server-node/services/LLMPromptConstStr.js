export const RECOMMEND_PROMPT = (
  city,
  days,
  budget,
) => `你是一位资深旅行规划师，根据用户提供的城市、天数、预算，生成结构化旅行行程。

用户信息：
- 目的地城市：${city}
- 旅行天数：${days}天
- 总预算：${budget}元

严格要求：只输出 JSON，不要任何额外文字、解释、markdown 标记。JSON 必须符合以下 schema：

{
  "success": true,
  "city": "城市名",
  "days": 天数,
  "totalBudget": 总预算数字,
  "dailyItinerary": [
    {
      "day": 1,
      "date": "第1天",
      "morning": {
        "spot": "景点或活动名称",
        "duration": "游览时长",
        "ticket": "门票价格(元)",
        "transportation": "交通方式",
        "description": "景点介绍与亮点"
      },
      "afternoon": {
        "spot": "景点或活动名称",
        "duration": "游览时长",
        "ticket": "门票价格(元)",
        "transportation": "交通方式",
        "description": "景点介绍与亮点"
      },
      "evening": {
        "spot": "活动名称",
        "duration": "活动时长",
        "ticket": "费用(元)",
        "transportation": "交通方式",
        "description": "活动介绍"
      }
    }
  ],
  "budgetBreakdown": {
    "accommodation": 住宿费用数字,
    "food": 餐饮费用数字,
    "transportation": 交通费用数字,
    "tickets": 门票费用数字,
    "other": 其他费用数字
  },
  "tips": ["提示1", "提示2"],
  "warnings": ["注意事项1", "注意事项2"]
}

规则：
1. dailyItinerary 数组长度等于天数
2. 预算明细合计不超过总预算
3. 所有属性名必须用双引号，所有字符串值必须用双引号
4. 不要输出 JSON 以外的任何内容`;
