const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { getIsMongoConnected, fallbackStore } = require('../config/db');

// Helper to sanitize key and mode
function parseKeyAndMode(req) {
  const rawKey = req.params.key;
  const normKey = rawKey ? rawKey.trim().toLowerCase() : '';
  const reqMode = req.params.mode || req.query.mode;
  const mode = reqMode === 'sticky' ? 'sticky' : 'normal';
  return { normKey, mode };
}

// GET document handler
async function handleGet(req, res) {
  try {
    const { normKey, mode } = parseKeyAndMode(req);
    if (!normKey) {
      return res.status(400).json({ error: 'Key is required' });
    }

    if (getIsMongoConnected()) {
      const doc = await Document.findOne({ key: normKey, mode });
      if (!doc) {
        return res.json({ key: normKey, mode, content: '', isSticky: mode === 'sticky' ? false : false, exists: false });
      }
      return res.json({
        key: doc.key,
        mode: doc.mode,
        content: doc.content,
        isSticky: doc.isSticky,
        exists: true
      });
    } else {
      const doc = fallbackStore.get(normKey, mode);
      if (!doc) {
        return res.json({ key: normKey, mode, content: '', isSticky: false, exists: false });
      }
      return res.json({
        key: doc.key,
        mode: doc.mode,
        content: doc.content,
        isSticky: doc.isSticky,
        exists: true
      });
    }
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Server error retrieving document' });
  }
}

// POST save / update document handler
async function handlePost(req, res) {
  try {
    const { normKey, mode } = parseKeyAndMode(req);
    if (!normKey) {
      return res.status(400).json({ error: 'Key is required' });
    }
    const { content = '', isSticky = mode === 'sticky' } = req.body;

    if (getIsMongoConnected()) {
      let doc = await Document.findOne({ key: normKey, mode });

      if (doc) {
        // If document is already sticky, reject modification
        if (doc.isSticky && !isSticky) {
          return res.status(403).json({
            error: 'Document is permanently sticky and read-only. Modifications are not allowed.',
            doc: { key: doc.key, mode: doc.mode, content: doc.content, isSticky: true, exists: true }
          });
        }

        doc.content = content;
        if (isSticky) {
          doc.isSticky = true;
        }
        await doc.save();
      } else {
        doc = await Document.create({
          key: normKey,
          mode,
          content,
          isSticky: Boolean(isSticky || mode === 'sticky')
        });
      }

      return res.json({
        key: doc.key,
        mode: doc.mode,
        content: doc.content,
        isSticky: doc.isSticky,
        exists: true
      });
    } else {
      try {
        const savedDoc = fallbackStore.set(normKey, mode, content, isSticky || mode === 'sticky');
        return res.json({
          key: savedDoc.key,
          mode: savedDoc.mode,
          content: savedDoc.content,
          isSticky: savedDoc.isSticky,
          exists: true
        });
      } catch (err) {
        const existing = fallbackStore.get(normKey, mode);
        return res.status(403).json({
          error: err.message,
          doc: existing ? { key: existing.key, mode: existing.mode, content: existing.content, isSticky: true, exists: true } : null
        });
      }
    }
  } catch (error) {
    console.error('Error saving document:', error);
    res.status(500).json({ error: 'Server error saving document' });
  }
}

// Routes
router.get('/:mode/:key', handleGet);
router.get('/:key', handleGet);

router.post('/:mode/:key', handlePost);
router.post('/:key', handlePost);

module.exports = router;
