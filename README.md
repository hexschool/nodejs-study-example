# Node.js 學習組教學

## Docker啟動方法

- 複製.env.example，並命名為.env，確認環境變數 DB_HOST=postgres
- 執行npm ci，Eslint將在此時生效
- 執行npm run clean，將環境清除
- 執行npm run start，初始化環境，從Docker Desktop看到兩個容器都正常（圖示應為綠色）

## 本地啟動伺服器方法
- 先執行Docker啟動方法，確保postgres容器運作正常
- 修改.env的DB_HOST環境變數為localhost
- 修改.env的PORT環境變數為3000，避免與容器使用的PORT衝突
- 執行npm run dev啟動伺服器

## 注意事項

- .env.example中的FIREBASE_SERVICE_ACCOUNT與FIREBASE_STORAGE_BUCKET，需要自行註冊firebase帳號，取得該資料後填入
- 請到github的Repository setting頁面，從左邊的選單進入secrets and variables頁面，並在Repository secrets分別新增名稱為FIREBASE_SERVICE_ACCOUNT與FIREBASE_STORAGE_BUCKET兩個機密變數，確保自動化測試可以正常運作