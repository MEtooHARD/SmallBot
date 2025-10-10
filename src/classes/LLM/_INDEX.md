# Universal LLM 架構 - 文件索引

## 📚 所有文件概覽

這個索引幫助你快速找到需要的文件。

## 🎯 從哪裡開始?

### 新手 (5 分鐘快速上手)

1. **[SUMMARY.md](./SUMMARY.md)** - 了解整體架構
2. **[QUICKREF.md](./QUICKREF.md)** - 查看常用 API
3. **[examples.ts](./examples.ts)** - 看實際代碼範例

### 開發者 (深入理解)

1. **[README.md](./README.md)** - 完整功能文檔
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 設計原理
3. **[DIAGRAMS.md](./DIAGRAMS.md)** - 視覺化理解

### 遷移現有代碼

1. **[MIGRATION.md](./MIGRATION.md)** - 遷移指南

## 📁 文件分類

### 核心代碼 (必須了解)

#### **UniversalTypes.ts** ⭐⭐⭐

> 統一的類型定義

- 定義了所有通用類型
- `UniversalMessage` - 訊息格式
- `UniversalChatRequest` - 請求參數
- `UniversalChatResponse` - 回應格式
- `LLMError` - 錯誤處理
- `ModelInfo` - 模型資訊

**何時看:** 想了解類型定義時

---

#### **UniversalLLM.ts** ⭐⭐⭐

> 統一的 LLM 管理器 (主要 API)

- 這是你會最常用到的類別
- `sendMessage()` - 簡單發送訊息
- `chat()` - 完整控制
- `chatStream()` - 串流回應
- `getHistory()` / `setHistory()` - 對話歷史
- `limitHistory()` - 限制歷史長度

**何時看:** 想知道如何使用 API 時

---

#### **BaseAdapter.ts** ⭐⭐

> 適配器基類和工廠

- `LLMAdapter` 抽象基類
- `AdapterFactory` 工廠模式
- 請求驗證和能力檢查

**何時看:** 想實作新的 LLM 提供者時

---

#### **GrokAdapter.ts** ⭐⭐

> Grok 適配器實作

- 格式轉換 (Universal ↔ Grok)
- 串流處理
- 成本計算
- 錯誤處理

**何時看:** 想了解適配器如何實作時,或要實作其他提供者時參考

---

#### **init.ts** ⭐

> 初始化和註冊

- 註冊所有可用的適配器
- 自動初始化

**何時看:** 要新增新的 LLM 提供者時

---

#### **index.ts** ⭐

> 模組入口

- 統一導出所有需要的類型和類別
- 方便導入

**何時看:** 想知道可以導入什麼時

---

### 文檔 (學習資源)

#### **SUMMARY.md** ⭐⭐⭐ 📘

> 架構總結

- 快速了解整體架構
- 你現在擁有什麼
- 如何使用
- 與原有設計對比

**建議閱讀時間:** 5 分鐘\
**適合:** 所有人,特別是剛開始的

---

#### **README.md** ⭐⭐⭐ 📗

> 完整使用文檔

- 設計目標
- 快速開始
- 核心概念
- API 參考
- 新增提供者指南
- 錯誤處理
- 對話歷史管理

**建議閱讀時間:** 20 分鐘\
**適合:** 想深入了解所有功能的開發者

---

#### **QUICKREF.md** ⭐⭐⭐ 📙

> 快速參考手冊

- 常用 API 一覽
- 代碼片段
- 常見模式
- 除錯技巧

**建議閱讀時間:** 5 分鐘\
**適合:** 已經了解基礎,需要查閱 API 時

---

#### **ARCHITECTURE.md** ⭐⭐ 📕

> 架構設計文檔

- 核心設計原則
- 資料流程
- 類型系統設計
- 適配器實作指南
- 錯誤處理策略
- 效能考量
- 擴展性設計

**建議閱讀時間:** 30 分鐘\
**適合:** 想了解設計原理,或要實作新功能的開發者

---

#### **DIAGRAMS.md** ⭐⭐ 📊

> 視覺化架構

- 整體架構圖
- 資料流程圖
- 類型系統圖
- 錯誤處理流程
- 適配器工廠模式
- 串流處理流程

**建議閱讀時間:** 15 分鐘\
**適合:** 視覺學習者,想快速理解架構的人

---

#### **MIGRATION.md** ⭐⭐⭐ 🔄

> 遷移指南

- 現有代碼分析
- 遷移策略 (3 種方案)
- 具體遷移步驟
- 進階功能遷移
- 對照表
- 測試建議
- 上線計劃

**建議閱讀時間:** 20 分鐘\
**適合:** 要從現有 Chat.ts 遷移的開發者

---

#### **examples.ts** ⭐⭐⭐ 💻

> 使用範例代碼

10+ 個實用範例:

1. 簡單對話
2. 多輪對話
3. 串流回應
4. 圖片輸入
5. Discord Bot 整合
6. 對話歷史管理
7. 模型能力檢查
8. 錯誤處理
9. 推理模型
10. 與現有 Chat 類別整合

**建議閱讀時間:** 10 分鐘\
**適合:** 想看實際代碼的開發者

---

### 原有代碼 (保留相容)

#### **types.ts**

> Grok 特定類型定義

- 原有的 Grok 類型
- 與新架構並存

---

#### **Wrapper.ts**

> GrokModel 類別

- 原有的 Grok 封裝
- GrokAdapter 內部使用

---

#### **Chat.ts**

> 原有的 Chat 類別

- 可以參考遷移
- 或保留並行使用

---

## 🗺️ 學習路徑

### 路徑 1: 快速上手 (30 分鐘)

```
SUMMARY.md (5 min)
    ↓
QUICKREF.md (5 min)
    ↓
examples.ts (10 min)
    ↓
開始寫代碼! (10 min)
```

### 路徑 2: 深入理解 (2 小時)

```
SUMMARY.md (5 min)
    ↓
README.md (20 min)
    ↓
ARCHITECTURE.md (30 min)
    ↓
DIAGRAMS.md (15 min)
    ↓
examples.ts (10 min)
    ↓
查看源代碼 (40 min)
```

### 路徑 3: 遷移現有代碼 (3 小時)

```
SUMMARY.md (5 min)
    ↓
QUICKREF.md (5 min)
    ↓
MIGRATION.md (20 min)
    ↓
examples.ts (10 min)
    ↓
開始遷移 (2 hours)
```

### 路徑 4: 實作新提供者 (4 小時)

```
README.md (20 min)
    ↓
ARCHITECTURE.md (30 min)
    ↓
查看 GrokAdapter.ts (30 min)
    ↓
查看 BaseAdapter.ts (20 min)
    ↓
實作新 Adapter (2 hours)
    ↓
測試 (40 min)
```

## 🔍 快速查找

### 我想知道...

#### "如何發送一條訊息?"

→ **QUICKREF.md** - 發送訊息部分

#### "如何處理對話歷史?"

→ **QUICKREF.md** - 對話歷史部分

#### "如何使用串流?"

→ **examples.ts** - 範例 3

#### "如何處理圖片?"

→ **examples.ts** - 範例 4

#### "如何整合到 Discord Bot?"

→ **examples.ts** - 範例 5 和 10

#### "架構是如何設計的?"

→ **ARCHITECTURE.md**

#### "有哪些圖表可以看?"

→ **DIAGRAMS.md**

#### "如何遷移現有代碼?"

→ **MIGRATION.md**

#### "如何新增新的 LLM 提供者?"

→ **README.md** - "新增提供者" 部分\
→ **ARCHITECTURE.md** - "適配器實作指南"

#### "有什麼類型可以用?"

→ **UniversalTypes.ts**\
→ **QUICKREF.md** - 訊息格式部分

#### "如何處理錯誤?"

→ **QUICKREF.md** - 錯誤處理部分\
→ **examples.ts** - 範例 8

## 📊 文件統計

| 類型     | 數量    | 文件                                                                |
| -------- | ------- | ------------------------------------------------------------------- |
| 源代碼   | 6       | UniversalTypes, BaseAdapter, GrokAdapter, UniversalLLM, init, index |
| 文檔     | 6       | README, QUICKREF, ARCHITECTURE, DIAGRAMS, SUMMARY, MIGRATION        |
| 範例     | 1       | examples.ts                                                         |
| 原有代碼 | 3+      | types.ts, Wrapper.ts, Chat.ts, ...                                  |
| **總計** | **16+** |                                                                     |

## 🎯 推薦閱讀順序

### 第一次接觸 (必讀)

1. ⭐⭐⭐ **SUMMARY.md**
2. ⭐⭐⭐ **QUICKREF.md**
3. ⭐⭐⭐ **examples.ts**

### 日常開發 (常用)

- ⭐⭐⭐ **QUICKREF.md** (查閱 API)
- ⭐⭐⭐ **examples.ts** (複製範例)

### 深入學習 (選讀)

- ⭐⭐ **README.md** (完整功能)
- ⭐⭐ **ARCHITECTURE.md** (設計原理)
- ⭐⭐ **DIAGRAMS.md** (視覺理解)

### 特定任務

- 🔄 **MIGRATION.md** (遷移代碼)
- 🔌 **BaseAdapter.ts** + **GrokAdapter.ts** (實作新提供者)

## 💡 使用建議

1. **從 SUMMARY.md 開始** - 快速了解整體
2. **用 QUICKREF.md 查閱** - 日常開發參考
3. **看 examples.ts 學習** - 複製粘貼範例
4. **遇到問題查文檔** - README 和 ARCHITECTURE
5. **視覺理解看 DIAGRAMS** - 看圖理解架構

## 🆘 需要幫助?

### 找不到答案?

1. 先查 **QUICKREF.md**
2. 再看 **examples.ts**
3. 最後讀 **README.md**

### 還是不懂?

1. 看 **DIAGRAMS.md** 的圖表
2. 讀 **ARCHITECTURE.md** 理解原理

### 要遷移代碼?

1. 直接看 **MIGRATION.md**

## 📝 更新歷史

- 2025-10-10: 初始版本創建
  - 創建完整架構
  - 實作 Grok 適配器
  - 編寫所有文檔

---

**祝你使用順利! 如有問題歡迎查閱相關文檔。** 🎉
