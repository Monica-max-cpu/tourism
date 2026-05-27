# B2B 集采模块 — API 契约文档

> 版本：v1.0  
> 基于：b2b-module-detail-design.md v1.0  
> 后端服务：`cm-cloud-b2b`，端口 7015  
> 网关前缀：`/b2b/**`

---

## 目录

1. [通用约定](#一通用约定)
2. [供应商管理](#二供应商管理)
3. [供应商商品档案](#三供应商商品档案)
4. [供应商仓库管理](#四供应商仓库管理)
5. [供应商报价管理](#五供应商报价管理)
6. [平台商品目录](#六平台商品目录)
7. [库存管理](#七库存管理)
8. [门店管理](#八门店管理)
9. [门店订单](#九门店订单)
10. [支付管理](#十支付管理)
11. [集采管理](#十一集采管理)
12. [发货收货](#十二发货收货)
13. [结算与利润](#十三结算与利润)
14. [枚举值速查](#十四枚举值速查)

---

## 一、通用约定

### 1.1 认证

所有接口（标注"公开"的除外）需携带以下请求头：

```
X-Access-Token: <JeecgBoot Token>
```

### 1.2 统一响应结构

```json
{
  "code": 200,
  "message": "成功",
  "result": {},
  "success": true,
  "timestamp": 1700000000000
}
```

| code | 含义 |
|------|------|
| 200 | 成功 |
| 400 | 参数校验失败 |
| 401 | 未登录或 Token 无效 |
| 403 | 无操作权限 |
| 500 | 服务器内部错误 |

### 1.3 分页请求参数（GET 列表接口通用）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `pageNo` | int | 1 | 页码（从 1 开始） |
| `pageSize` | int | 10 | 每页条数（最大 100） |
| `column` | string | create_time | 排序字段 |
| `order` | string | desc | asc / desc |

### 1.4 分页响应结构

```json
{
  "code": 200,
  "result": {
    "records": [],
    "total": 100,
    "size": 10,
    "current": 1,
    "pages": 10
  }
}
```

---

## 二、供应商管理

### 2.1 供应商入驻申请

```
POST /b2b/supplier/apply
权限：公开（无需 Token）
```

**Request Body**

```json
{
  "supplierName": "山西晋商食品有限公司",
  "contactPerson": "张三",
  "contactPhone": "13800138000",
  "contactEmail": "zhangsan@example.com",
  "province": "山西省",
  "city": "太原市",
  "address": "迎泽区某街道123号",
  "businessLicense": "https://oss.example.com/license/xxx.jpg",
  "categoryIds": "cat_001,cat_002",
  "supplySourceId": "supply-uuid-xxxx",
  "remark": "已有供应商资质，请关联审核"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| supplierName | string | ✅ | 公司名称，最长100字 |
| contactPerson | string | ✅ | 联系人姓名 |
| contactPhone | string | ✅ | 手机号 |
| contactEmail | string | | 联系邮箱 |
| province | string | | 省份 |
| city | string | | 城市 |
| address | string | | 详细地址 |
| businessLicense | string | | 营业执照图片 URL |
| categoryIds | string | | 经营品类 ID，逗号分隔 |
| supplySourceId | string | | 关联现有 supply 模块供应商 ID（可选） |

**Response**

```json
{
  "code": 200,
  "result": {
    "id": "b2b-supplier-uuid",
    "supplierName": "山西晋商食品有限公司",
    "status": 0,
    "statusLabel": "待审核"
  }
}
```

---

### 2.2 供应商列表（平台管理员）

```
GET /b2b/supplier/list
权限：平台管理员
```

**Query 参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| supplierName | string | 模糊搜索供应商名称 |
| status | int | 状态筛选：0=待审 1=已通过 2=已拒绝 3=已停用 |
| province | string | 省份筛选 |
| pageNo | int | 页码 |
| pageSize | int | 每页条数 |

**Response**

```json
{
  "code": 200,
  "result": {
    "records": [
      {
        "id": "b2b-supplier-uuid",
        "supplierName": "山西晋商食品有限公司",
        "contactPerson": "张三",
        "contactPhone": "13800138000",
        "province": "山西省",
        "city": "太原市",
        "categoryIds": "cat_001,cat_002",
        "status": 1,
        "statusLabel": "已通过",
        "loginAccount": "supplier_xxxxx",
        "createTime": "2025-01-01 10:00:00",
        "reviewTime": "2025-01-02 09:00:00",
        "reviewer": "admin"
      }
    ],
    "total": 25,
    "size": 10,
    "current": 1
  }
}
```

---

### 2.3 供应商详情

```
GET /b2b/supplier/{id}
权限：平台管理员 / 供应商本人
```

**Path 参数**：`id` — 供应商 ID

**Response**

```json
{
  "code": 200,
  "result": {
    "id": "b2b-supplier-uuid",
    "supplierName": "山西晋商食品有限公司",
    "contactPerson": "张三",
    "contactPhone": "13800138000",
    "contactEmail": "zhangsan@example.com",
    "province": "山西省",
    "city": "太原市",
    "address": "迎泽区某街道123号",
    "businessLicense": "https://oss.example.com/license/xxx.jpg",
    "categoryIds": "cat_001,cat_002",
    "status": 1,
    "reviewRemark": "",
    "reviewer": "admin",
    "reviewTime": "2025-01-02 09:00:00",
    "loginAccount": "supplier_xxxxx",
    "supplySourceId": null,
    "createTime": "2025-01-01 10:00:00"
  }
}
```

---

### 2.4 审核入驻申请

```
PUT /b2b/supplier/review
权限：平台管理员
```

**Request Body**

```json
{
  "id": "b2b-supplier-uuid",
  "status": 1,
  "reviewRemark": "资质齐全，审核通过"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | ✅ | 供应商 ID |
| status | int | ✅ | 1=通过 2=拒绝 |
| reviewRemark | string | | 审核备注（拒绝时建议必填） |

**Response**（通过时返回生成的登录账号）

```json
{
  "code": 200,
  "result": {
    "id": "b2b-supplier-uuid",
    "status": 1,
    "loginAccount": "supplier_20250101001",
    "initialPassword": "Cm@123456"
  }
}
```

---

### 2.5 更新供应商信息

```
PUT /b2b/supplier/update
权限：供应商本人
```

**Request Body**（仅允许更新以下字段）

```json
{
  "id": "b2b-supplier-uuid",
  "contactPerson": "李四",
  "contactPhone": "13900139000",
  "contactEmail": "lisi@example.com",
  "address": "新地址",
  "businessLicense": "https://oss.example.com/license/new.jpg"
}
```

---

### 2.6 停用/启用供应商

```
PUT /b2b/supplier/status
权限：平台管理员
```

```json
{
  "id": "b2b-supplier-uuid",
  "status": 3,
  "remark": "违规操作，暂停合作"
}
```

| status 值 | 含义 |
|-----------|------|
| 1 | 启用 |
| 3 | 停用 |

---

## 三、供应商商品档案

### 3.1 新增商品档案

```
POST /b2b/supplier/product/add
权限：供应商
```

**Request Body**

```json
{
  "supplierId": "b2b-supplier-uuid",
  "productName": "山西老陈醋（特级）",
  "brand": "水塔",
  "spec": "500ml×12瓶/箱",
  "unit": "箱",
  "barcode": "6901234567890",
  "categoryId": "cat_001",
  "images": "[\"https://oss.example.com/img/1.jpg\",\"https://oss.example.com/img/2.jpg\"]",
  "description": "纯粮酿造，陈酿5年"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| supplierId | string | ✅ | 所属供应商 ID |
| productName | string | ✅ | 商品名称 |
| unit | string | ✅ | 计量单位 |
| brand | string | | 品牌 |
| spec | string | | 规格型号 |
| barcode | string | | 商品条码 |
| categoryId | string | | 分类 ID |
| images | string | | 图片 JSON 数组字符串 |
| description | string | | 商品描述 |

**Response**

```json
{
  "code": 200,
  "result": {
    "id": "product-uuid",
    "productName": "山西老陈醋（特级）",
    "status": 1
  }
}
```

---

### 3.2 修改商品档案

```
PUT /b2b/supplier/product/edit
权限：供应商（本人商品）
```

Request Body 同新增，需包含 `id` 字段。

---

### 3.3 商品列表

```
GET /b2b/supplier/product/list
权限：供应商（查本人）/ 平台管理员（可跨供应商）
```

**Query 参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| supplierId | string | 供应商 ID（管理员可指定，供应商端自动取当前用户） |
| productName | string | 商品名称模糊搜索 |
| status | int | 1=启用 0=停用 |
| categoryId | string | 分类筛选 |

**Response records 字段**

```json
{
  "id": "product-uuid",
  "supplierId": "b2b-supplier-uuid",
  "supplierName": "山西晋商食品有限公司",
  "productName": "山西老陈醋（特级）",
  "brand": "水塔",
  "spec": "500ml×12瓶/箱",
  "unit": "箱",
  "barcode": "6901234567890",
  "categoryId": "cat_001",
  "images": "[\"https://oss.example.com/img/1.jpg\"]",
  "status": 1,
  "createTime": "2025-01-05 10:00:00"
}
```

---

### 3.4 删除商品档案（逻辑删除）

```
DELETE /b2b/supplier/product/{id}
权限：供应商（本人商品）
```

> ⚠️ 若商品存在有效报价单（status=1），禁止删除，返回 400。

---

## 四、供应商仓库管理

### 4.1 新增仓库

```
POST /b2b/supplier/warehouse/add
权限：供应商
```

```json
{
  "supplierId": "b2b-supplier-uuid",
  "warehouseName": "太原主仓",
  "province": "山西省",
  "city": "太原市",
  "address": "小店区工业街1号",
  "contactPerson": "王五",
  "contactPhone": "13700137000",
  "isDefault": 1
}
```

### 4.2 仓库列表

```
GET /b2b/supplier/warehouse/list
权限：供应商（本人）/ 平台管理员
```

| 参数 | 说明 |
|------|------|
| supplierId | 供应商 ID |

### 4.3 修改仓库

```
PUT /b2b/supplier/warehouse/edit
权限：供应商
```

### 4.4 删除仓库

```
DELETE /b2b/supplier/warehouse/{id}
权限：供应商
```

---

## 五、供应商报价管理

### 5.1 提交报价单（含阶梯）

```
POST /b2b/supplier/quote/submit
权限：供应商
```

**Request Body**

```json
{
  "supplierId": "b2b-supplier-uuid",
  "productId": "product-uuid",
  "minOrderQty": 10,
  "basePrice": 88.00,
  "currency": "CNY",
  "validFrom": "2025-02-01",
  "validTo": "2025-04-30",
  "leadTimeDays": 3,
  "remark": "春节期间产能有限，提前备货",
  "tiers": [
    { "minQty": 10, "maxQty": 49, "unitPrice": 88.00 },
    { "minQty": 50, "maxQty": 199, "unitPrice": 82.00 },
    { "minQty": 200, "maxQty": null, "unitPrice": 78.00 }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| supplierId | string | ✅ | 供应商 ID |
| productId | string | ✅ | 商品 ID |
| minOrderQty | int | ✅ | 最低起订量 |
| basePrice | decimal | ✅ | 基础单价（无阶梯时生效） |
| validFrom | date | ✅ | 有效期开始（YYYY-MM-DD） |
| validTo | date | ✅ | 有效期结束 |
| leadTimeDays | int | | 备货周期（天），默认3 |
| tiers | array | | 阶梯价列表（为空时使用 basePrice） |
| tiers[].minQty | int | ✅ | 阶梯最低数量（含） |
| tiers[].maxQty | int | | 阶梯最高数量（null=无上限） |
| tiers[].unitPrice | decimal | ✅ | 阶梯单价 |

**Response**

```json
{
  "code": 200,
  "result": {
    "id": "quote-uuid",
    "status": 0,
    "statusLabel": "待平台审核"
  }
}
```

---

### 5.2 报价单列表

```
GET /b2b/supplier/quote/list
权限：供应商（本人）/ 平台管理员
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| supplierId | 供应商 ID（管理员可指定） |
| productId | 商品 ID |
| status | 0=待审 1=已生效 2=已过期 3=已撤回 |

**Response records 字段**

```json
{
  "id": "quote-uuid",
  "supplierId": "b2b-supplier-uuid",
  "supplierName": "山西晋商食品有限公司",
  "productId": "product-uuid",
  "productName": "山西老陈醋（特级）",
  "minOrderQty": 10,
  "basePrice": 88.00,
  "validFrom": "2025-02-01",
  "validTo": "2025-04-30",
  "leadTimeDays": 3,
  "status": 1,
  "statusLabel": "已生效",
  "tiers": [
    { "id": "tier-uuid-1", "minQty": 10, "maxQty": 49, "unitPrice": 88.00 },
    { "id": "tier-uuid-2", "minQty": 50, "maxQty": 199, "unitPrice": 82.00 },
    { "id": "tier-uuid-3", "minQty": 200, "maxQty": null, "unitPrice": 78.00 }
  ]
}
```

---

### 5.3 审核报价单

```
PUT /b2b/supplier/quote/review
权限：平台管理员
```

```json
{
  "id": "quote-uuid",
  "status": 1,
  "reviewRemark": "报价合理，通过审核"
}
```

| status | 含义 |
|--------|------|
| 1 | 审核通过（报价生效） |
| 2 | 审核拒绝（需提供 reviewRemark） |

---

### 5.4 撤回报价

```
PUT /b2b/supplier/quote/withdraw/{id}
权限：供应商（本人报价，且 status=0 待审状态）
```

> ⚠️ 已生效（status=1）的报价如需撤回，需平台管理员操作。

---

## 六、平台商品目录

> 注意：供应商报价（内部价）与平台目录（门店侧刊价）**完全独立**，供应商不可见 catalog 的 `preferredQuoteId` 及对应价格。

### 6.1 新建平台目录商品

```
POST /b2b/catalog/add
权限：平台管理员
```

**Request Body**

```json
{
  "productName": "山西老陈醋（特级）500ml×12",
  "productImages": "[\"https://oss.example.com/catalog/img/1.jpg\"]",
  "categoryId": "cat_001",
  "unit": "箱",
  "basePrice": 108.00,
  "minOrderQty": 5,
  "commissionRate": 0,
  "preferredQuoteId": "quote-uuid",
  "description": "山西特产，正宗老陈醋",
  "sortOrder": 10,
  "catalogTiers": [
    { "minQty": 5, "maxQty": 19, "unitPrice": 108.00 },
    { "minQty": 20, "maxQty": 99, "unitPrice": 102.00 },
    { "minQty": 100, "maxQty": null, "unitPrice": 96.00 }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| productName | string | ✅ | 展示商品名称 |
| unit | string | ✅ | 计量单位 |
| basePrice | decimal | ✅ | 基础刊价 |
| minOrderQty | int | | 最低起订量，默认1 |
| commissionRate | decimal | | 服务费率，默认0（纯差价模式） |
| preferredQuoteId | string | | 优选供应商报价 ID（内部维护） |
| catalogTiers | array | | 门店侧阶梯价（与供应商阶梯无关） |

---

### 6.2 编辑目录商品

```
PUT /b2b/catalog/edit
权限：平台管理员
```

Request Body 同新建，需包含 `id`。

---

### 6.3 上/下架操作

```
PUT /b2b/catalog/shelf/{id}
权限：平台管理员
```

**Request Body**

```json
{
  "status": 1,
  "remark": "正式上架销售"
}
```

| status | 含义 |
|--------|------|
| 0 | 下架 |
| 1 | 上架 |
| 2 | 标记售罄 |

---

### 6.4 门店侧目录列表

```
GET /b2b/catalog/list
权限：门店
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| categoryId | 分类筛选 |
| productName | 关键词搜索 |
| minPrice | 价格区间下限 |
| maxPrice | 价格区间上限 |

**Response records 字段**（不含供应商信息及 preferredQuoteId）

```json
{
  "id": "catalog-uuid",
  "productName": "山西老陈醋（特级）500ml×12",
  "productImages": "[\"https://oss.example.com/catalog/img/1.jpg\"]",
  "categoryId": "cat_001",
  "unit": "箱",
  "basePrice": 108.00,
  "minOrderQty": 5,
  "status": 1,
  "sortOrder": 10,
  "description": "山西特产，正宗老陈醋",
  "catalogTiers": [
    { "minQty": 5, "maxQty": 19, "unitPrice": 108.00 },
    { "minQty": 20, "maxQty": 99, "unitPrice": 102.00 },
    { "minQty": 100, "maxQty": null, "unitPrice": 96.00 }
  ]
}
```

---

### 6.5 商品详情（门店侧）

```
GET /b2b/catalog/detail/{id}
权限：门店
```

Response 同列表单条，额外返回 `description` 富文本字段。

---

### 6.6 后台管理列表（含供应商信息）

```
GET /b2b/catalog/admin/list
权限：平台管理员
```

**Response records 额外字段**

```json
{
  "preferredQuoteId": "quote-uuid",
  "preferredSupplierName": "山西晋商食品有限公司",
  "supplierBasePrice": 78.00,
  "margin": 18.00,
  "marginRate": 0.1875
}
```

> 注意：`supplierBasePrice`（供应商报价）和 `margin`（利润空间）**仅平台管理员可见**，前端需按角色控制字段显示。

---

## 七、库存管理

### 7.1 供应商申报补货

```
POST /b2b/stock/replenish
权限：供应商
```

```json
{
  "supplierId": "b2b-supplier-uuid",
  "productId": "product-uuid",
  "warehouseId": "warehouse-uuid",
  "replenishQty": 200,
  "remark": "新一批生产完成"
}
```

**Response**

```json
{
  "code": 200,
  "result": {
    "stockId": "stock-uuid",
    "availableQty": 350,
    "totalQty": 350
  }
}
```

---

### 7.2 供应商可售库存列表

```
GET /b2b/stock/supplier/list
权限：供应商（本人）/ 平台管理员
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| supplierId | 供应商 ID |
| productId | 商品 ID |
| warehouseId | 仓库 ID |
| alertOnly | true=仅查预警库存 |

**Response records 字段**

```json
{
  "id": "stock-uuid",
  "supplierId": "b2b-supplier-uuid",
  "supplierName": "山西晋商食品有限公司",
  "productId": "product-uuid",
  "productName": "山西老陈醋（特级）",
  "warehouseId": "warehouse-uuid",
  "warehouseName": "太原主仓",
  "availableQty": 350,
  "lockedQty": 50,
  "totalQty": 400,
  "alertQty": 100,
  "isAlert": false,
  "lastReplenishTime": "2025-01-10 14:00:00"
}
```

---

### 7.3 修改库存预警阈值

```
PUT /b2b/stock/alert-qty
权限：供应商（本人）/ 平台管理员
```

```json
{
  "stockId": "stock-uuid",
  "alertQty": 100
}
```

---

### 7.4 库存变动日志

```
GET /b2b/stock/log
权限：平台管理员
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| supplierId | 供应商 ID |
| productId | 商品 ID |
| changeType | LOCK / UNLOCK / DEDUCT / REPLENISH |
| bizType | STORE_ORDER / COLLECTIVE_ORDER / DELIVERY |
| startTime | 开始时间（yyyy-MM-dd HH:mm:ss） |
| endTime | 结束时间 |

**Response records 字段**

```json
{
  "id": "log-uuid",
  "stockId": "stock-uuid",
  "supplierId": "b2b-supplier-uuid",
  "supplierName": "山西晋商食品有限公司",
  "productId": "product-uuid",
  "productName": "山西老陈醋（特级）",
  "changeType": "LOCK",
  "changeQty": -20,
  "beforeAvailable": 350,
  "afterAvailable": 330,
  "beforeLocked": 50,
  "afterLocked": 70,
  "bizId": "store-order-uuid",
  "bizType": "STORE_ORDER",
  "operator": "system",
  "remark": "门店下单锁定库存",
  "createTime": "2025-01-15 10:30:00"
}
```

---

## 八、门店管理

### 8.1 门店入驻申请

```
POST /b2b/store/apply
权限：公开（无需 Token）
```

**Request Body**

```json
{
  "storeName": "太原兴和便利店",
  "storeType": 1,
  "contactPerson": "赵六",
  "contactPhone": "13600136000",
  "contactEmail": "zhaoliu@example.com",
  "province": "山西省",
  "city": "太原市",
  "address": "杏花岭区某路456号",
  "businessLicense": "https://oss.example.com/store/license/xxx.jpg"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| storeName | string | ✅ | 门店名称 |
| storeType | int | | 1=普通门店（默认）2=连锁门店 |
| contactPerson | string | ✅ | 负责人姓名 |
| contactPhone | string | ✅ | 联系电话 |
| address | string | ✅ | 详细地址 |

---

### 8.2 门店列表

```
GET /b2b/store/list
权限：平台管理员
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| storeName | 模糊搜索 |
| status | 0=待审 1=已通过 2=已拒绝 3=已停用 |
| storeType | 1=普通 2=连锁 |
| province | 省份 |

**Response records 字段**

```json
{
  "id": "store-uuid",
  "storeName": "太原兴和便利店",
  "storeType": 1,
  "storeTypeLabel": "普通门店",
  "contactPerson": "赵六",
  "contactPhone": "13600136000",
  "province": "山西省",
  "city": "太原市",
  "address": "杏花岭区某路456号",
  "status": 1,
  "statusLabel": "已通过",
  "loginAccount": "store_20250101001",
  "creditLimit": 0,
  "createTime": "2025-01-08 09:00:00"
}
```

---

### 8.3 审核门店入驻

```
PUT /b2b/store/review
权限：平台管理员
```

```json
{
  "id": "store-uuid",
  "status": 1,
  "reviewRemark": "资质齐全，审核通过"
}
```

**Response**（通过时返回账号信息）

```json
{
  "code": 200,
  "result": {
    "id": "store-uuid",
    "status": 1,
    "loginAccount": "store_20250101001",
    "initialPassword": "Cm@123456"
  }
}
```

---

### 8.4 门店虚拟库存查询

```
GET /b2b/store/stock/list
权限：门店（本人）
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| productId | 门店商品 ID |
| alertOnly | true=仅查预警库存 |

**Response records 字段**

```json
{
  "id": "store-stock-uuid",
  "storeId": "store-uuid",
  "productId": "store-product-uuid",
  "productName": "山西老陈醋（特级）",
  "catalogId": "catalog-uuid",
  "availableQty": 24,
  "alertQty": 5,
  "isAlert": false,
  "lastInTime": "2025-01-20 14:00:00"
}
```

---

### 8.5 门店商品档案列表

```
GET /b2b/store/product/list
权限：门店（本人）
```

**Response records 字段**

```json
{
  "id": "store-product-uuid",
  "storeId": "store-uuid",
  "catalogId": "catalog-uuid",
  "productName": "山西老陈醋（特级）",
  "spec": "500ml×12瓶/箱",
  "unit": "箱",
  "retailPrice": 128.00,
  "status": 1,
  "createTime": "2025-01-20 14:05:00"
}
```

---

## 九、门店订单

### 9.1 创建采购单

```
POST /b2b/store/order/create
权限：门店
```

**Request Body**

```json
{
  "storeId": "store-uuid",
  "deliveryAddress": {
    "receiverName": "赵六",
    "receiverPhone": "13600136000",
    "province": "山西省",
    "city": "太原市",
    "address": "杏花岭区某路456号"
  },
  "remark": "尽快发货",
  "items": [
    {
      "catalogId": "catalog-uuid-1",
      "quantity": 20
    },
    {
      "catalogId": "catalog-uuid-2",
      "quantity": 50
    }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| storeId | string | ✅ | 下单门店 ID |
| deliveryAddress | object | ✅ | 收货地址（JSON 快照存储） |
| items | array | ✅ | 订单明细，至少1条 |
| items[].catalogId | string | ✅ | 平台目录商品 ID |
| items[].quantity | int | ✅ | 下单数量，需 ≥ 商品 minOrderQty |

**Response**

```json
{
  "code": 200,
  "result": {
    "orderId": "store-order-uuid",
    "orderNo": "B2B20250115001",
    "storeId": "store-uuid",
    "orderStatus": 0,
    "statusLabel": "待支付",
    "totalAmount": 3720.00,
    "expiredTime": "2025-01-16 10:30:00",
    "paymentInfo": {
      "paymentId": "payment-uuid",
      "paymentAmount": 3720.00,
      "bankName": "工商银行",
      "bankAccount": "6222020200000000001",
      "accountName": "山西文旅平台运营有限公司",
      "remark": "转账备注请填写订单号：B2B20250115001"
    },
    "items": [
      {
        "catalogId": "catalog-uuid-1",
        "productName": "山西老陈醋（特级）500ml×12",
        "unit": "箱",
        "quantity": 20,
        "catalogPrice": 108.00,
        "actualPrice": 102.00,
        "subtotal": 2040.00
      }
    ]
  }
}
```

> 注意：下单时系统自动计算阶梯价，`actualPrice` 为实际成交价。

---

### 9.2 订单列表

```
GET /b2b/store/order/list
权限：门店（本人订单）
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| orderStatus | 订单状态（见枚举） |
| orderNo | 订单编号精确搜索 |
| startTime | 下单时间区间开始 |
| endTime | 下单时间区间结束 |

**Response records 字段**

```json
{
  "id": "store-order-uuid",
  "orderNo": "B2B20250115001",
  "storeId": "store-uuid",
  "storeName": "太原兴和便利店",
  "orderStatus": 1,
  "statusLabel": "已支付，待集采",
  "totalAmount": 3720.00,
  "paidAmount": 3720.00,
  "paymentMethod": "OFFLINE",
  "paymentTime": "2025-01-15 14:00:00",
  "itemCount": 2,
  "createTime": "2025-01-15 10:30:00",
  "expiredTime": "2025-01-16 10:30:00"
}
```

---

### 9.3 订单详情

```
GET /b2b/store/order/detail/{id}
权限：门店（本人）/ 平台管理员
```

**Response**

```json
{
  "code": 200,
  "result": {
    "id": "store-order-uuid",
    "orderNo": "B2B20250115001",
    "storeId": "store-uuid",
    "storeName": "太原兴和便利店",
    "orderStatus": 3,
    "statusLabel": "发货中",
    "totalAmount": 3720.00,
    "paidAmount": 3720.00,
    "paymentMethod": "OFFLINE",
    "paymentTime": "2025-01-15 14:00:00",
    "deliveryAddress": {
      "receiverName": "赵六",
      "receiverPhone": "13600136000",
      "province": "山西省",
      "city": "太原市",
      "address": "杏花岭区某路456号"
    },
    "remark": "尽快发货",
    "createTime": "2025-01-15 10:30:00",
    "items": [
      {
        "id": "order-item-uuid",
        "catalogId": "catalog-uuid-1",
        "productName": "山西老陈醋（特级）500ml×12",
        "spec": "500ml×12瓶/箱",
        "unit": "箱",
        "quantity": 20,
        "catalogPrice": 108.00,
        "actualPrice": 102.00,
        "subtotal": 2040.00,
        "receivedQty": 0,
        "collectiveItemId": "collective-item-uuid"
      }
    ],
    "deliveries": [
      {
        "deliveryNo": "DL20250118001",
        "status": 1,
        "statusLabel": "已发货",
        "deliveryQty": 20,
        "logisticsCompany": "顺丰速运",
        "trackingNo": "SF1234567890",
        "shippedTime": "2025-01-18 09:00:00"
      }
    ]
  }
}
```

---

### 9.4 取消订单（付款前）

```
PUT /b2b/store/order/cancel/{id}
权限：门店（本人，且 orderStatus=0 待支付）
```

**Request Body**

```json
{
  "cancelReason": "暂时不需要了"
}
```

> ⚠️ 已支付订单（status≥1）不可直接取消，需联系平台管理员。

---

### 9.5 确认收货

```
PUT /b2b/store/order/confirm-receive
权限：门店（本人）
```

```json
{
  "deliveryId": "delivery-uuid",
  "receivedQty": 20,
  "receiveRemark": "货物完好，已验收"
}
```

**Response**

```json
{
  "code": 200,
  "result": {
    "deliveryId": "delivery-uuid",
    "deliveryStatus": 2,
    "orderStatus": 5,
    "orderStatusLabel": "已完成",
    "storeStockUpdated": true
  }
}
```

---

### 9.6 后台订单管理列表（平台管理员）

```
GET /b2b/store/order/admin/list
权限：平台管理员
```

**Query 参数**（在门店侧基础上增加）

| 参数 | 说明 |
|------|------|
| storeId | 按门店筛选 |
| supplierId | 按集采关联供应商筛选 |
| orderStatus | 订单状态 |
| paymentStatus | 支付状态 |

**Response records 额外字段**

```json
{
  "collectiveOrderId": "collective-order-uuid",
  "collectiveNo": "CL20250116001",
  "supplierName": "山西晋商食品有限公司"
}
```

---

## 十、支付管理

### 10.1 创建支付记录

```
POST /b2b/payment/create
权限：门店
```

```json
{
  "storeOrderId": "store-order-uuid"
}
```

**Response**（V1 人工确认模式）

```json
{
  "code": 200,
  "result": {
    "paymentId": "payment-uuid",
    "storeOrderId": "store-order-uuid",
    "orderNo": "B2B20250115001",
    "paymentAmount": 3720.00,
    "paymentMethod": "OFFLINE",
    "paymentStatus": 0,
    "bankInfo": {
      "bankName": "工商银行",
      "bankAccount": "6222020200000000001",
      "accountName": "山西文旅平台运营有限公司",
      "remark": "转账请备注订单号：B2B20250115001"
    },
    "expireTime": "2025-01-16 10:30:00"
  }
}
```

---

### 10.2 人工确认收款（V1 核心接口）

```
PUT /b2b/payment/manual/confirm
权限：平台管理员
```

```json
{
  "paymentId": "payment-uuid",
  "actualAmount": 3720.00,
  "remark": "已核实工行转账，到账3720元，凭证号ICBC20250115XXXX"
}
```

**Response**

```json
{
  "code": 200,
  "result": {
    "paymentId": "payment-uuid",
    "paymentStatus": 1,
    "storeOrderId": "store-order-uuid",
    "orderStatus": 1,
    "orderStatusLabel": "已支付，待集采",
    "collectiveTriggerChecked": true
  }
}
```

---

### 10.3 查询支付状态

```
GET /b2b/payment/query/{orderNo}
权限：门店 / 平台管理员
```

**Response**

```json
{
  "code": 200,
  "result": {
    "paymentId": "payment-uuid",
    "orderNo": "B2B20250115001",
    "paymentAmount": 3720.00,
    "actualAmount": 3720.00,
    "paymentStatus": 1,
    "statusLabel": "支付成功",
    "paymentMethod": "OFFLINE",
    "paidTime": "2025-01-15 13:55:00",
    "confirmBy": "operator_admin"
  }
}
```

---

### 10.4 待确认收款列表（运营工作台）

```
GET /b2b/payment/pending/list
权限：平台管理员
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| storeName | 门店名称搜索 |
| orderNo | 订单号 |
| startTime | 下单时间开始 |
| endTime | 下单时间结束 |

**Response records 字段**

```json
{
  "paymentId": "payment-uuid",
  "storeOrderId": "store-order-uuid",
  "orderNo": "B2B20250115001",
  "storeId": "store-uuid",
  "storeName": "太原兴和便利店",
  "paymentAmount": 3720.00,
  "paymentMethod": "OFFLINE",
  "paymentStatus": 0,
  "createTime": "2025-01-15 10:30:00",
  "expireTime": "2025-01-16 10:30:00",
  "waitingHours": 3.5
}
```

---

### 10.5 第三方支付回调（预留骨架，TODO）

```
POST /b2b/payment/callback/tonglian  ← TODO: 通联支付回调
POST /b2b/payment/callback/wechat    ← TODO: 微信支付回调
POST /b2b/payment/callback/alipay    ← TODO: 支付宝回调
```

> V1 不实现，方法体留空并添加 TODO 注释。

---

## 十一、集采管理

### 11.1 待集采订单列表（运营工作台）

```
GET /b2b/collective/pending-orders
权限：平台管理员
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| catalogId | 按商品筛选 |
| supplierId | 按优选供应商筛选 |

**Response**（按商品分组聚合，非分页）

```json
{
  "code": 200,
  "result": [
    {
      "catalogId": "catalog-uuid-1",
      "productName": "山西老陈醋（特级）500ml×12",
      "unit": "箱",
      "totalQty": 320,
      "storeCount": 8,
      "orderCount": 8,
      "earliestOrderTime": "2025-01-14 09:00:00",
      "elapsedHours": 28.5,
      "timeThresholdHours": 48,
      "remainingHours": 19.5,
      "qtyThreshold": 500,
      "qtyProgress": 0.64,
      "preferredSupplierName": "山西晋商食品有限公司",
      "preferredQuoteId": "quote-uuid",
      "quoteStatus": 1,
      "quoteStatusLabel": "已生效",
      "isQuoteExpired": false,
      "orders": [
        {
          "orderId": "store-order-uuid",
          "orderNo": "B2B20250114001",
          "storeName": "太原兴和便利店",
          "qty": 20,
          "paidTime": "2025-01-14 10:00:00"
        }
      ]
    }
  ]
}
```

---

### 11.2 手动发起集采

```
POST /b2b/collective/trigger
权限：平台管理员
```

**Request Body（方式一：按商品触发）**

```json
{
  "triggerMode": "BY_CATALOG",
  "catalogId": "catalog-uuid-1",
  "supplierQuoteId": "quote-uuid",
  "remark": "提前触发，备货充足"
}
```

**Request Body（方式二：按订单列表触发）**

```json
{
  "triggerMode": "BY_ORDERS",
  "orderIds": ["store-order-uuid-1", "store-order-uuid-2"],
  "remark": "批量处理"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| triggerMode | string | ✅ | BY_CATALOG=按商品 / BY_ORDERS=按订单 |
| catalogId | string | 条件必填 | triggerMode=BY_CATALOG 时必填 |
| orderIds | array | 条件必填 | triggerMode=BY_ORDERS 时必填 |
| supplierQuoteId | string | | 覆盖优选供应商报价（不填用 preferredQuoteId） |
| remark | string | | 备注 |

**Response**

```json
{
  "code": 200,
  "result": {
    "collectiveOrders": [
      {
        "id": "collective-order-uuid",
        "collectiveNo": "CL20250115001",
        "supplierId": "b2b-supplier-uuid",
        "supplierName": "山西晋商食品有限公司",
        "orderCount": 8,
        "totalQty": 320,
        "totalAmount": 24960.00,
        "triggerType": "MANUAL"
      }
    ]
  }
}
```

---

### 11.3 集采单列表

```
GET /b2b/collective/list
权限：平台管理员
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| supplierId | 供应商筛选 |
| orderStatus | 集采单状态 |
| triggerType | QTY_THRESHOLD / TIME_THRESHOLD / MANUAL |
| startTime | 生成时间开始 |
| endTime | 生成时间结束 |

**Response records 字段**

```json
{
  "id": "collective-order-uuid",
  "collectiveNo": "CL20250115001",
  "supplierId": "b2b-supplier-uuid",
  "supplierName": "山西晋商食品有限公司",
  "orderStatus": 0,
  "statusLabel": "待供应商确认",
  "totalAmount": 24960.00,
  "orderCount": 8,
  "triggerType": "MANUAL",
  "triggerTypeLabel": "手动触发",
  "createTime": "2025-01-15 16:00:00",
  "confirmTime": null,
  "expectedDeliveryDate": null
}
```

---

### 11.4 集采单详情

```
GET /b2b/collective/detail/{id}
权限：平台管理员 / 供应商（关联自己的集采单）
```

**Response**

```json
{
  "code": 200,
  "result": {
    "id": "collective-order-uuid",
    "collectiveNo": "CL20250115001",
    "supplierId": "b2b-supplier-uuid",
    "supplierName": "山西晋商食品有限公司",
    "orderStatus": 1,
    "statusLabel": "供应商已确认",
    "totalAmount": 24960.00,
    "orderCount": 8,
    "triggerType": "MANUAL",
    "remark": "提前触发",
    "confirmTime": "2025-01-15 17:00:00",
    "expectedDeliveryDate": "2025-01-18",
    "items": [
      {
        "id": "collective-item-uuid",
        "productId": "product-uuid",
        "productName": "山西老陈醋（特级）",
        "unit": "箱",
        "totalQty": 320,
        "deliveredQty": 0,
        "unitPrice": 78.00,
        "subtotal": 24960.00,
        "quoteId": "quote-uuid",
        "storeBreakdown": [
          {
            "storeId": "store-uuid",
            "storeName": "太原兴和便利店",
            "orderNo": "B2B20250114001",
            "qty": 20
          }
        ]
      }
    ]
  }
}
```

> 注意：`storeBreakdown`（门店分配明细）对供应商**不可见**，供应商只看汇总数量。

---

### 11.5 供应商确认接单

```
PUT /b2b/collective/supplier/confirm/{id}
权限：供应商（关联自己的集采单）
```

**Request Body**

```json
{
  "expectedDeliveryDate": "2025-01-18",
  "remark": "已安排生产，按时发货"
}
```

---

### 11.6 录入发货信息

```
POST /b2b/collective/delivery/ship
权限：供应商
```

```json
{
  "collectiveItemId": "collective-item-uuid",
  "storeId": "store-uuid",
  "warehouseId": "warehouse-uuid",
  "deliveryQty": 20,
  "logisticsCompany": "顺丰速运",
  "trackingNo": "SF1234567890",
  "remark": ""
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| collectiveItemId | string | ✅ | 集采明细 ID |
| storeId | string | ✅ | 收货门店 ID（直发模式） |
| deliveryQty | int | ✅ | 本次发货数量 |
| logisticsCompany | string | | 物流公司 |
| trackingNo | string | | 快递单号 |

**Response**

```json
{
  "code": 200,
  "result": {
    "deliveryId": "delivery-uuid",
    "deliveryNo": "DL20250118001",
    "status": 1,
    "statusLabel": "已发货",
    "stockDeducted": true
  }
}
```

---

### 11.7 查询集采触发配置

```
GET /b2b/collective/config
权限：平台管理员
```

**Response**

```json
{
  "code": 200,
  "result": {
    "id": "config-uuid",
    "configKey": "DEFAULT",
    "qtyThreshold": 500,
    "timeThresholdHours": 48,
    "isActive": 1,
    "remark": "默认集采触发配置"
  }
}
```

---

### 11.8 更新集采触发配置

```
PUT /b2b/collective/config
权限：平台管理员
```

```json
{
  "id": "config-uuid",
  "qtyThreshold": 300,
  "timeThresholdHours": 36,
  "isActive": 1,
  "remark": "调整触发阈值"
}
```

---

## 十二、发货收货

### 12.1 发货单列表

```
GET /b2b/delivery/list
权限：平台管理员 / 供应商（本人相关） / 门店（本人相关）
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| collectiveOrderId | 集采单 ID |
| storeId | 门店 ID |
| supplierId | 供应商 ID |
| status | 0=待发货 1=已发货 2=已确认 3=异常 |
| trackingNo | 快递单号精确查询 |

**Response records 字段**

```json
{
  "id": "delivery-uuid",
  "deliveryNo": "DL20250118001",
  "collectiveOrderId": "collective-order-uuid",
  "collectiveNo": "CL20250115001",
  "storeId": "store-uuid",
  "storeName": "太原兴和便利店",
  "supplierId": "b2b-supplier-uuid",
  "supplierName": "山西晋商食品有限公司",
  "deliveryMode": 1,
  "deliveryModeLabel": "供应商直发门店",
  "deliveryQty": 20,
  "receivedQty": 0,
  "logisticsCompany": "顺丰速运",
  "trackingNo": "SF1234567890",
  "status": 1,
  "statusLabel": "已发货",
  "shippedTime": "2025-01-18 09:00:00",
  "receivedTime": null
}
```

---

### 12.2 发货单详情

```
GET /b2b/delivery/detail/{id}
权限：平台管理员 / 供应商 / 门店
```

---

### 12.3 标记异常

```
PUT /b2b/delivery/exception/{id}
权限：平台管理员
```

```json
{
  "remark": "货物破损，待处理"
}
```

---

## 十三、结算与利润

### 13.1 门店结算单列表

```
GET /b2b/settlement/store/list
权限：平台管理员（全量）/ 门店（本人）
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| storeId | 门店 ID（管理员可指定） |
| status | 0=待结算 1=已结算 2=已退款 |
| startTime | 时间筛选 |
| endTime | 时间筛选 |

**Response records 字段**

```json
{
  "id": "store-settlement-uuid",
  "settlementNo": "SS20250120001",
  "storeId": "store-uuid",
  "storeName": "太原兴和便利店",
  "storeOrderId": "store-order-uuid",
  "orderNo": "B2B20250115001",
  "collectiveOrderId": "collective-order-uuid",
  "settlementAmount": 3720.00,
  "commissionAmount": 0,
  "totalPayable": 3720.00,
  "paidAmount": 3720.00,
  "status": 1,
  "statusLabel": "已结算",
  "settleTime": "2025-01-20 10:00:00"
}
```

---

### 13.2 供应商结算单列表

```
GET /b2b/settlement/supplier/list
权限：平台管理员（全量）/ 供应商（本人）
```

**Response records 字段**

```json
{
  "id": "supplier-settlement-uuid",
  "settlementNo": "PS20250120001",
  "supplierId": "b2b-supplier-uuid",
  "supplierName": "山西晋商食品有限公司",
  "collectiveOrderId": "collective-order-uuid",
  "collectiveNo": "CL20250115001",
  "settlementAmount": 24960.00,
  "paidAmount": 0,
  "status": 0,
  "statusLabel": "待付款",
  "bankName": "工商银行",
  "bankAccount": "6222020200000000002"
}
```

---

### 13.3 平台确认付款给供应商

```
PUT /b2b/settlement/supplier/pay/{id}
权限：平台管理员
```

```json
{
  "actualPaidAmount": 24960.00,
  "remark": "工行转账，流水号ICBC20250120XXXX"
}
```

---

### 13.4 差价利润记录列表

```
GET /b2b/profit/list
权限：平台管理员
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| collectiveOrderId | 集采单 ID |
| startTime | 利润计算时间开始 |
| endTime | 利润计算时间结束 |

**Response records 字段**

```json
{
  "id": "profit-uuid",
  "collectiveOrderId": "collective-order-uuid",
  "collectiveNo": "CL20250115001",
  "storeSettlementTotal": 3720.00,
  "supplierSettlementTotal": 2496.00,
  "commissionTotal": 0,
  "grossProfit": 1224.00,
  "profitRate": 0.329,
  "calcTime": "2025-01-20 10:05:00"
}
```

---

### 13.5 利润汇总统计

```
GET /b2b/profit/summary
权限：平台管理员
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| startTime | 统计开始时间 |
| endTime | 统计结束时间 |

**Response**

```json
{
  "code": 200,
  "result": {
    "totalStoreRevenue": 128000.00,
    "totalSupplierCost": 89600.00,
    "totalCommission": 0,
    "totalGrossProfit": 38400.00,
    "avgProfitRate": 0.30,
    "collectiveOrderCount": 15,
    "trend": [
      {
        "date": "2025-01-15",
        "storeRevenue": 15000.00,
        "supplierCost": 10500.00,
        "grossProfit": 4500.00
      }
    ]
  }
}
```

---

## 十四、枚举值速查

### 供应商状态（cm_b2b_supplier.status）

| 值 | 标签 |
|----|------|
| 0 | 待审核 |
| 1 | 已通过 |
| 2 | 已拒绝 |
| 3 | 已停用 |

### 报价单状态（cm_b2b_supplier_quote.status）

| 值 | 标签 |
|----|------|
| 0 | 待平台审核 |
| 1 | 已生效 |
| 2 | 已过期 |
| 3 | 已撤回 |

### 平台目录状态（cm_b2b_platform_catalog.status）

| 值 | 标签 |
|----|------|
| 0 | 下架 |
| 1 | 上架 |
| 2 | 售罄 |

### 门店订单状态（cm_b2b_store_order.order_status）

| 值 | 标签 |
|----|------|
| 0 | 待支付 |
| 1 | 已支付，待集采 |
| 2 | 集采中 |
| 3 | 发货中 |
| 4 | 部分收货 |
| 5 | 已完成 |
| 6 | 已取消 |
| 7 | 退款中 |
| 8 | 已退款 |

### 支付状态（cm_b2b_payment.payment_status）

| 值 | 标签 |
|----|------|
| 0 | 待支付 |
| 1 | 支付成功 |
| 2 | 支付失败 |
| 3 | 已退款 |

### 集采单状态（cm_b2b_collective_order.order_status）

| 值 | 标签 |
|----|------|
| 0 | 待供应商确认 |
| 1 | 供应商已确认 |
| 2 | 发货中 |
| 3 | 部分发货 |
| 4 | 全部发货完成 |
| 5 | 已完成（门店全部收货） |
| 6 | 已取消 |

### 发货单状态（cm_b2b_delivery.status）

| 值 | 标签 |
|----|------|
| 0 | 待发货 |
| 1 | 已发货 |
| 2 | 门店已确认收货 |
| 3 | 异常 |

### 库存变动类型（cm_b2b_stock_log.change_type）

| 值 | 说明 |
|----|------|
| LOCK | 门店下单，锁定可售库存 |
| UNLOCK | 订单取消，归还锁定库存 |
| DEDUCT | 供应商发货，正式扣减库存 |
| REPLENISH | 供应商申报补货，增加可售库存 |

### 集采触发类型（cm_b2b_collective_order.trigger_type）

| 值 | 说明 |
|----|------|
| QTY_THRESHOLD | 数量阈值自动触发 |
| TIME_THRESHOLD | 时间兜底自动触发 |
| MANUAL | 平台运营手动触发 |

---

## 附录：接口权限矩阵

| 接口模块 | 平台管理员 | 供应商 | 门店 | 公开 |
|---------|----------|--------|------|------|
| 供应商入驻申请 | - | - | - | ✅ |
| 供应商列表/详情（含审核） | ✅ | 本人 | - | - |
| 商品档案管理 | ✅查看 | ✅管理 | - | - |
| 仓库管理 | ✅查看 | ✅管理 | - | - |
| 报价单管理 | ✅审核/查看 | ✅提交/撤回 | - | - |
| 平台目录管理 | ✅全量 | - | ✅只读（外部价） | - |
| 库存管理 | ✅全量 | ✅申报/查看本人 | - | - |
| 门店入驻申请 | - | - | - | ✅ |
| 门店管理 | ✅全量 | - | 本人 | - |
| 门店订单 | ✅全量 | - | ✅本人 | - |
| 支付确认 | ✅人工确认 | - | ✅发起/查状态 | - |
| 集采管理 | ✅全量 | ✅确认/发货（相关单据） | - | - |
| 结算管理 | ✅全量 | 本人结算单 | 本人结算单 | - |
| 利润统计 | ✅ | - | - | - |
