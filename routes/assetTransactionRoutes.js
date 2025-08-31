const express = require('express');
const router = express.Router();
const {issueFormPage,issueFormAPI,returnFormPage,returnFormAPI, 
    issuedAssetsList,scrapFormPage,scrapFormAPI,assetHistoryPage,assetHistoryAPI} = require("../controllers/assetTransactionController");



// GET /assets/issue
router.get('/issue',issueFormPage);
// POST /assets/issue
router.post('/api/issue', issueFormAPI);

router.get('/return', returnFormPage);
router.post('/api/return', returnFormAPI);
// GET /assets/issued-assets/:employeeId
router.get('/api/issued-assets/:employeeId', issuedAssetsList);


router.get('/scrap', scrapFormPage);
router.post('/api/scrap', scrapFormAPI);

router.get("/history",(req,res)=>{
    res.render("asset/list",{showHistoryAction:true})
})
// Asset History Page
router.get('/history/:assetId', assetHistoryPage);
// API for asset transaction history (JSON, if needed for AJAX)
router.get('/api/history/:assetId', assetHistoryAPI);

module.exports = router;