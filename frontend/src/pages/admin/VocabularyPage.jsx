import { useState, useEffect, useCallback } from 'react';
import {
  Button, Input, Table, Tag, Modal, Drawer, Checkbox, Spin,
  Space, Tooltip, Popconfirm, message, Select, Form, Breadcrumb, Card, Badge, Empty, Typography
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  ThunderboltOutlined, BookOutlined, HomeOutlined, AppstoreOutlined,
  SoundOutlined, DeleteFilled
} from '@ant-design/icons';
import * as adminService from '../../services/adminService';

const { Text } = Typography;

const topicColors = [
  { bg: "#e6f4ff", border: "#91caff", icon: "#1677ff" },
  { bg: "#f6ffed", border: "#95de64", icon: "#52c41a" },
  { bg: "#fff7e6", border: "#ffd591", icon: "#fa8c16" },
  { bg: "#fff0f6", border: "#ffadd2", icon: "#eb2f96" },
  { bg: "#f9f0ff", border: "#d3adf7", icon: "#722ed1" },
  { bg: "#e6fffb", border: "#87e8de", icon: "#13c2c2" },
];

export default function VocabularyPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [view, setView] = useState("topics");
  
  // Vocabulary state
  const [words, setWords] = useState([]);
  const [loadingWords, setLoadingWords] = useState(false);
  
  // Hover states for sidebar & grid
  const [hoveredCatId, setHoveredCatId] = useState(null);
  const [hoveredTopicId, setHoveredTopicId] = useState(null);

  // Filter text
  const [catSearch, setCatSearch] = useState('');
  const [wordSearch, setWordSearch] = useState('');
  
  // Bulk Selection
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // AI Bulk Generate state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiInputText, setAiInputText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiWords, setAiWords] = useState([]);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [savingAI, setSavingAI] = useState(false);
  
  // Modals state
  const [wordDrawerOpen, setWordDrawerOpen] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [savingWord, setSavingWord] = useState(false);
  const [wordForm] = Form.useForm();

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [savingCat, setSavingCat] = useState(false);
  const [catForm] = Form.useForm();

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [savingTopic, setSavingTopic] = useState(false);
  const [topicForm] = Form.useForm();

  // Load Categories & Topics
  const fetchCategories = useCallback(async () => {
    try {
      const res = await adminService.listCategories();
      const catData = res?.data || res;
      
      const topicsRes = await adminService.listTopics({ limit: 1000 });
      const allTopics = topicsRes?.data?.topics || [];
      
      const mappedCats = (Array.isArray(catData) ? catData : []).map(cat => ({
        ...cat,
        topics: allTopics.filter(t => t.categoryCode === cat.code)
      }));

      setCategories(mappedCats);
      if (mappedCats.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(mappedCats[0].id);
      }
    } catch (e) {
      message.error('Failed to load categories');
    }
  }, [selectedCategoryId]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // Load Words for selected topic
  const fetchWords = useCallback(async () => {
    if (!selectedTopic) return;
    try {
      setLoadingWords(true);
      const res = await adminService.listVocabularies(selectedTopic.id);
      const data = res?.data || res;
      setWords(data?.vocabularies || []);
    } catch (e) {
      message.error('Failed to load vocabularies');
    } finally {
      setLoadingWords(false);
    }
  }, [selectedTopic]);

  useEffect(() => { fetchWords(); }, [fetchWords]);

  const currentCategory = categories.find(c => c.id === selectedCategoryId) || null;
  const filteredWords = words.filter(w =>
    w.word.toLowerCase().includes(wordSearch.toLowerCase()) ||
    (w.vietnameseMeaning || w.meaning)?.toLowerCase().includes(wordSearch.toLowerCase()) ||
    w.phonetic?.toLowerCase().includes(wordSearch.toLowerCase())
  );
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()));

  // --- UI Handlers ---
  const handleSelectCat = (cat) => {
    setSelectedCategoryId(cat.id);
    setSelectedTopic(null);
    setView("topics");
  };

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    setView("words");
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setView("topics");
  };

  // --- Category Actions ---
  const openCatCreate = () => {
    setEditingCat(null);
    catForm.resetFields();
    setCatModalOpen(true);
  };

  const openCatEdit = (cat, e) => {
    e.stopPropagation();
    setEditingCat(cat);
    catForm.setFieldsValue({ code: cat.code, name: cat.name, description: cat.description, sortOrder: cat.sortOrder });
    setCatModalOpen(true);
  };

  const handleSaveCat = async () => {
    try {
      const vals = await catForm.validateFields();
      setSavingCat(true);
      if (editingCat) {
        await adminService.updateCategory(editingCat.id, vals);
        message.success('Category updated');
      } else {
        await adminService.createCategory(vals);
        message.success('Category created');
      }
      setCatModalOpen(false);
      fetchCategories();
    } catch (e) {
      message.error(e.response?.data?.message || 'Failed to save category');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCat = async (id, e) => {
    e.stopPropagation();
    try {
      await adminService.deleteCategory(id);
      message.success('Category deleted');
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
        setView("topics");
      }
      fetchCategories();
    } catch (e) {
      message.error(e.response?.data?.message || 'Failed to delete category');
    }
  };

  // --- Topic Actions ---
  const openTopicCreate = () => {
    setEditingTopic(null);
    topicForm.resetFields();
    if (currentCategory) {
      topicForm.setFieldsValue({ categoryCode: currentCategory.code });
    }
    setTopicModalOpen(true);
  };

  const openTopicEdit = (topic, e) => {
    if(e) e.stopPropagation();
    setEditingTopic(topic);
    topicForm.setFieldsValue({
      name: topic.name, description: topic.description,
      categoryCode: topic.categoryCode, level: topic.level,
      isPremium: topic.isPremium ? 'true' : 'false'
    });
    setTopicModalOpen(true);
  };

  const handleSaveTopic = async () => {
    try {
      const vals = await topicForm.validateFields();
      vals.isPremium = vals.isPremium === 'true';
      setSavingTopic(true);
      if (editingTopic) {
        await adminService.updateTopic(editingTopic.id, vals);
        message.success('Topic updated');
        if (selectedTopic?.id === editingTopic.id) setSelectedTopic({ ...selectedTopic, ...vals });
      } else {
        await adminService.createTopic(vals);
        message.success('Topic created');
      }
      setTopicModalOpen(false);
      fetchCategories();
    } catch (e) {
      message.error(e.response?.data?.message || 'Failed to save topic');
    } finally {
      setSavingTopic(false);
    }
  };

  const handleDeleteTopic = async (id, e) => {
    if(e) e.stopPropagation();
    try {
      await adminService.deleteTopic(id);
      message.success('Topic deleted');
      if (selectedTopic?.id === id) handleBackToTopics();
      fetchCategories();
    } catch (e) {
      message.error(e.response?.data?.message || 'Failed to delete topic');
    }
  };

  // --- Word Actions ---
  const openWordCreate = () => {
    setEditingWord(null);
    wordForm.resetFields();
    setWordDrawerOpen(true);
  };

  const openWordEdit = (word) => {
    setEditingWord(word);
    wordForm.setFieldsValue({
      word: word.word, phonetic: word.phonetic, meaning: word.vietnameseMeaning || word.meaning, type: word.type
    });
    setWordDrawerOpen(true);
  };

  const handleSaveWord = async () => {
    try {
      const vals = await wordForm.validateFields();
      const apiVals = { ...vals, vietnameseMeaning: vals.meaning };
      delete apiVals.meaning;
      
      setSavingWord(true);
      if (editingWord) {
        await adminService.updateVocabulary(editingWord.id, apiVals);
        message.success('Word updated');
      } else {
        await adminService.createVocabulary(selectedTopic.id, apiVals);
        message.success('Word created');
      }
      setWordDrawerOpen(false);
      fetchWords();
      fetchCategories();
    } catch (e) {
      message.error('Failed to save word');
    } finally {
      setSavingWord(false);
    }
  };

  const handleDeleteWord = async (id) => {
    try {
      await adminService.deleteVocabulary(id);
      message.success('Word deleted');
      setSelectedRowKeys(prev => prev.filter(k => k !== id));
      fetchWords();
      fetchCategories();
    } catch (e) {
      message.error('Failed to delete word');
    }
  };

  const handleDeleteSelectedWords = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      await Promise.all(selectedRowKeys.map(id => adminService.deleteVocabulary(id)));
      message.success(`Deleted ${selectedRowKeys.length} words`);
      setSelectedRowKeys([]);
      fetchWords();
      fetchCategories();
    } catch(e) {
      message.error('Failed to delete some words');
    }
  };

  // --- AI Generate ---
  const handleAIGenerate = async () => {
    if (!aiInputText.trim()) { message.warning('Please enter some words'); return; }
    const wordList = aiInputText.split(/[\n,]+/).map(w => w.trim()).filter(Boolean);
    if (wordList.length === 0) return;
    
    setAiLoading(true);
    try {
      const res = await adminService.aiGenerateVocabulary(selectedTopic.id, wordList);
      const generated = res?.data?.generatedVocabularies || res?.data || res || [];
      const genArray = Array.isArray(generated) ? generated : [];
      setAiWords(genArray.map((w, idx) => ({ ...w, _key: idx, include: true })));
      setAiGenerated(true);
    } catch (e) {
      message.error(e.response?.data?.message || 'Failed to generate vocabulary');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAI = async () => {
    const selected = aiWords.filter((w) => w.include);
    if (selected.length === 0) return;
    
    setSavingAI(true);
    try {
      await adminService.bulkSaveVocabularies(selectedTopic.id, selected);
      message.success(`${selected.length} words saved successfully!`);
      setAiModalOpen(false);
      setAiGenerated(false);
      setAiInputText('');
      setAiWords([]);
      fetchWords();
      fetchCategories();
    } catch (e) {
      message.error('Failed to save vocabularies');
    } finally {
      setSavingAI(false);
    }
  };

  // Columns for WordTable
  const wordColumns = [
    {
      title: "Từ vựng", dataIndex: "word", key: "word", width: 160,
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #e6f4ff, #bae0ff)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <SoundOutlined style={{ fontSize: 13, color: "#1677ff" }} />
          </div>
          <Text strong style={{ fontSize: 14, color: "#1a1a2e" }}>{text}</Text>
        </div>
      ),
    },
    {
      title: "Phiên âm", dataIndex: "phonetic", key: "phonetic", width: 150,
      render: (text) => (
        <Tag style={{ borderRadius: 20, background: "#f6ffed", border: "1px solid #95de64", color: "#389e0d", fontSize: 12, fontFamily: "monospace", padding: "2px 10px" }}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Nghĩa của từ", dataIndex: "vietnameseMeaning", key: "meaning", width: 180,
      render: (text, record) => <Text style={{ color: "#262626", fontSize: 13 }}>{text || record.meaning}</Text>,
    },
    {
      title: "Loại từ", dataIndex: "type", key: "type",
      render: (t) => <Tag color="blue" style={{ borderRadius: 20, fontSize: 11 }}>{t}</Tag>
    },
    {
      title: "Thao tác", key: "actions", width: 100, align: "center",
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openWordEdit(record)}
              style={{ width: 30, height: 30, borderRadius: 8, color: "#595959", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }} />
          </Tooltip>
          <Popconfirm title="Xóa từ vựng" description={`Xóa từ "${record.word}"?`} onConfirm={() => handleDeleteWord(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }} placement="left">
            <Tooltip title="Xóa">
              <Button type="text" size="small" icon={<DeleteOutlined />} danger
                style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden", background: "#f5f5f5", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* ---------------- LEFT SIDEBAR (Category List) ---------------- */}
      <div style={{ width: 320, minWidth: 320, height: "100%", background: "#ffffff", borderRight: "1px solid #f0f0f0", display: "flex", flexDirection: "column", boxShadow: "2px 0 8px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BookOutlined style={{ color: "#1677ff", fontSize: 18 }} />
            <span style={{ fontSize: 17, fontWeight: 700, color: "#1a1a2e", letterSpacing: "-0.2px" }}>Danh mục (Category)</span>
          </div>
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openCatCreate} style={{ borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
            Thêm
          </Button>
        </div>
        <div style={{ padding: "12px 16px 8px" }}>
          <Input placeholder="Tìm kiếm danh mục..." size="small" value={catSearch} onChange={e => setCatSearch(e.target.value)} style={{ borderRadius: 8, fontSize: 13 }} prefix={<span style={{ color: "#bfbfbf", fontSize: 12 }}>🔍</span>} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 16px" }}>
          {filteredCategories.map((cat) => {
            const isSelected = cat.id === selectedCategoryId;
            const isHovered = cat.id === hoveredCatId;
            return (
              <div
                key={cat.id}
                onClick={() => handleSelectCat(cat)}
                onMouseEnter={() => setHoveredCatId(cat.id)}
                onMouseLeave={() => setHoveredCatId(null)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", marginBottom: 2, borderRadius: 10, cursor: "pointer", transition: "all 0.15s ease",
                  background: isSelected ? "linear-gradient(135deg, #e6f4ff 0%, #f0f8ff 100%)" : isHovered ? "#f8f9fa" : "transparent",
                  borderLeft: isSelected ? "3px solid #1677ff" : "3px solid transparent",
                  boxShadow: isSelected ? "0 1px 4px rgba(22, 119, 255, 0.12)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s ease",
                    background: isSelected ? "linear-gradient(135deg, #1677ff, #4096ff)" : "#f5f5f5"
                  }}>
                    <BookOutlined style={{ fontSize: 15, color: isSelected ? "#fff" : "#8c8c8c" }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 500, color: isSelected ? "#1677ff" : "#262626", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 1 }}>{cat.topics?.length || 0} chủ đề</div>
                  </div>
                </div>
                {(isHovered || isSelected) && (
                  <div style={{ display: "flex", gap: 2, flexShrink: 0, marginLeft: 6 }} onClick={e => e.stopPropagation()}>
                    <Tooltip title="Chỉnh sửa"><Button type="text" size="small" icon={<EditOutlined />} onClick={(e) => openCatEdit(cat, e)} style={{ width: 26, height: 26, borderRadius: 6, color: "#595959", padding: 0 }} /></Tooltip>
                    <Popconfirm title="Xóa danh mục" description="Bạn có chắc muốn xóa?" onConfirm={(e) => handleDeleteCat(cat.id, e)} onCancel={e=>e.stopPropagation()} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }} placement="right">
                      <Tooltip title="Xóa"><Button type="text" size="small" icon={<DeleteOutlined />} style={{ width: 26, height: 26, borderRadius: 6, color: "#ff4d4f", padding: 0 }} /></Tooltip>
                    </Popconfirm>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0", background: "#fafafa", flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: "#8c8c8c", textAlign: "center" }}>
            Tổng: <strong style={{ color: "#595959" }}>{filteredCategories.length}</strong> danh mục
          </div>
        </div>
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f5f5f5" }}>
        {!currentCategory ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#8c8c8c", gap: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: "#e6f4ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOutlined style={{ fontSize: 36, color: "#1677ff" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#595959" }}>Chọn một danh mục</div>
              <div style={{ fontSize: 13, color: "#8c8c8c", marginTop: 4 }}>Chọn danh mục từ danh sách bên trái để bắt đầu</div>
            </div>
          </div>
        ) : view === "topics" ? (
          /* ----- TOPIC GRID VIEW ----- */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "20px 28px 16px", background: "#ffffff", borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
              <Breadcrumb style={{ marginBottom: 12 }} items={[{ title: <><HomeOutlined style={{ fontSize: 12, marginRight: 4 }} />Danh mục</> }, { title: <><BookOutlined style={{ fontSize: 12, marginRight: 4 }} />{currentCategory.name}</> }]} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a2e", letterSpacing: "-0.3px" }}>{currentCategory.name}</h1>
                  <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                    <Tag icon={<AppstoreOutlined />} color="blue" style={{ borderRadius: 20, fontSize: 12 }}>{currentCategory.topics?.length || 0} Chủ đề</Tag>
                  </div>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={openTopicCreate} style={{ borderRadius: 10, height: 40, paddingInline: 20, fontWeight: 600, boxShadow: "0 2px 8px rgba(22, 119, 255, 0.25)" }}>
                  Thêm Topic
                </Button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
              {!currentCategory.topics || currentCategory.topics.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}><Empty description="Chưa có chủ đề nào" /></div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                  {currentCategory.topics.map((topic, index) => {
                    const color = topicColors[index % topicColors.length];
                    const isHovered = topic.id === hoveredTopicId;
                    return (
                      <Card key={topic.id} onMouseEnter={() => setHoveredTopicId(topic.id)} onMouseLeave={() => setHoveredTopicId(null)}
                        style={{ borderRadius: 16, border: `1px solid ${isHovered ? color.icon : "#f0f0f0"}`, transition: "all 0.2s ease", boxShadow: isHovered ? "0 8px 24px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.04)", cursor: "default", overflow: "hidden" }}
                        styles={{ body: { padding: 0 } }}>
                        <div style={{ padding: "18px 20px 14px", background: isHovered ? `linear-gradient(135deg, ${color.bg}, #fff)` : "#fafafa", borderBottom: "1px solid #f0f0f0", transition: "background 0.2s ease" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: color.bg, border: `1px solid ${color.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                                <AppstoreOutlined style={{ fontSize: 16, color: color.icon }} />
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.4 }}>{topic.name}</div>
                            </div>
                            <Badge count={`${topic._count?.vocabularies || topic.wordCount || 0} từ`} style={{ backgroundColor: color.bg, color: color.icon, border: `1px solid ${color.border}`, borderRadius: 20, fontSize: 11, fontWeight: 600, padding: "0 8px", height: 22, lineHeight: "22px", flexShrink: 0 }} />
                          </div>
                        </div>
                        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff" }}>
                          <Button type="link" size="small" onClick={() => handleSelectTopic(topic)} style={{ padding: "0 4px", fontSize: 12, fontWeight: 600, color: color.icon }}>Xem từ vựng</Button>
                          <div style={{ display: "flex", gap: 4 }}>
                            <Tooltip title="Chỉnh sửa"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => openTopicEdit(topic)} style={{ width: 28, height: 28, borderRadius: 6, color: "#595959", padding: 0 }} /></Tooltip>
                            <Popconfirm title="Xóa chủ đề" description={`Xóa "${topic.name}"?`} onConfirm={() => handleDeleteTopic(topic.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }} placement="top">
                              <Tooltip title="Xóa"><Button type="text" size="small" icon={<DeleteOutlined />} danger style={{ width: 28, height: 28, borderRadius: 6, padding: 0 }} /></Tooltip>
                            </Popconfirm>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : selectedTopic ? (
          /* ----- WORD TABLE VIEW ----- */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "20px 28px 16px", background: "#ffffff", borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
              <Breadcrumb style={{ marginBottom: 12 }} items={[
                { title: <><HomeOutlined style={{ fontSize: 12, marginRight: 4 }} />Danh mục</> },
                { title: <div onClick={handleBackToTopics} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}><BookOutlined style={{ fontSize: 12 }} /><span>{currentCategory.name}</span></div> },
                { title: <><AppstoreOutlined style={{ fontSize: 12, marginRight: 4 }} />{selectedTopic.name}</> },
              ]} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a2e", letterSpacing: "-0.3px" }}>{selectedTopic.name}</h1>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="blue" style={{ borderRadius: 20, fontSize: 12 }}>{words.length} từ vựng</Tag>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: "14px 28px", background: "#ffffff", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
              <Input placeholder="Tìm kiếm từ vựng, nghĩa..." prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />} value={wordSearch} onChange={e => setWordSearch(e.target.value)} style={{ maxWidth: 320, borderRadius: 10, fontSize: 13 }} allowClear />
              <Space>
                {selectedRowKeys.length > 0 && (
                  <Popconfirm title="Xóa các từ đã chọn" description={`Xóa ${selectedRowKeys.length} từ đã chọn?`} onConfirm={handleDeleteSelectedWords} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                    <Button danger icon={<DeleteFilled />} style={{ borderRadius: 10, fontWeight: 600 }}>Xóa đã chọn ({selectedRowKeys.length})</Button>
                  </Popconfirm>
                )}
                <Button type="primary" icon={<ThunderboltOutlined />} onClick={() => setAiModalOpen(true)} style={{ borderRadius: 10, background: "linear-gradient(135deg, #6C63FF, #9C94FF)", border: "none", fontWeight: 600 }}>
                  AI Generate
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={openWordCreate} style={{ borderRadius: 10, fontWeight: 600, boxShadow: "0 2px 8px rgba(22, 119, 255, 0.25)" }}>
                  Thêm từ mới
                </Button>
              </Space>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
              <Table
                rowKey="id"
                columns={wordColumns}
                dataSource={filteredWords}
                loading={loadingWords}
                rowSelection={{ type: "checkbox", selectedRowKeys, onChange: setSelectedRowKeys }}
                pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} từ`, style: { marginTop: 8 } }}
                style={{ borderRadius: 12, overflow: "hidden", boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                locale={{ emptyText: <div style={{ padding: "40px 0", color: "#8c8c8c" }}>{wordSearch ? "Không tìm thấy từ nào" : "Chưa có từ vựng"}</div> }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* --- Modals --- */}
      <Drawer title={editingWord ? `Chỉnh sửa: ${editingWord.word}` : 'Thêm từ mới'} open={wordDrawerOpen} onClose={() => setWordDrawerOpen(false)} width={380} extra={<Button type="primary" loading={savingWord} onClick={handleSaveWord} style={{ backgroundColor: '#1677ff', borderRadius: 8 }}>Lưu</Button>}>
        <Form form={wordForm} layout="vertical">
          <Form.Item name="word" label="Từ vựng" rules={[{ required: true }]}><Input style={{ borderRadius: 8 }} /></Form.Item>
          <Form.Item name="phonetic" label="Phiên âm" rules={[{ required: true }]}><Input style={{ borderRadius: 8 }} /></Form.Item>
          <Form.Item name="meaning" label="Nghĩa tiếng Việt" rules={[{ required: true }]}><Input style={{ borderRadius: 8 }} /></Form.Item>
          <Form.Item name="type" label="Loại từ" rules={[{ required: true }]}>
            <Select options={[{ value: 'noun', label: 'Noun' }, { value: 'verb', label: 'Verb' }, { value: 'adjective', label: 'Adjective' }, { value: 'adverb', label: 'Adverb' }, { value: 'phrase', label: 'Phrase' }]} />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal title={editingCat ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục'} open={catModalOpen} onCancel={() => setCatModalOpen(false)} onOk={handleSaveCat} confirmLoading={savingCat}>
        <Form form={catForm} layout="vertical">
          <Form.Item name="code" label="Mã danh mục (vd: GENERAL, TOEIC)" rules={[{ required: true }]}><Input disabled={!!editingCat} /></Form.Item>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="sortOrder" label="Thứ tự hiển thị" initialValue={0}><Input type="number" /></Form.Item>
        </Form>
      </Modal>

      <Modal title={editingTopic ? 'Chỉnh sửa Topic' : 'Thêm Topic'} open={topicModalOpen} onCancel={() => setTopicModalOpen(false)} onOk={handleSaveTopic} confirmLoading={savingTopic}>
        <Form form={topicForm} layout="vertical">
          <Form.Item name="name" label="Tên Topic" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="categoryCode" label="Danh mục" rules={[{ required: true }]}>
            <Select options={categories.map(c => ({ label: c.name, value: c.code }))} />
          </Form.Item>
          <Form.Item name="level" label="Level" initialValue="B1">
            <Select options={['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => ({ label: l, value: l }))} />
          </Form.Item>
          <Form.Item name="isPremium" label="Premium?" initialValue="false">
            <Select options={[{ label: 'Free', value: 'false' }, { label: 'Premium', value: 'true' }]} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <Modal title={<><ThunderboltOutlined style={{ color: '#1677ff', marginRight: 8 }} />✨ AI Bulk Generate Vocabulary</>} open={aiModalOpen} onCancel={() => { if (!savingAI) { setAiModalOpen(false); setAiGenerated(false); setAiInputText(''); setAiWords([]); } }} width={860} maskClosable={!savingAI} closable={!savingAI} footer={aiGenerated ? (<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#888', fontSize: 13 }}>Đã chọn {aiWords.filter(w => w.include).length} / {aiWords.length} từ</span><Space><Button disabled={savingAI} onClick={() => { setAiGenerated(false); setAiInputText(''); setAiWords([]); }}>Hủy</Button><Button type="primary" onClick={handleSaveAI} loading={savingAI}>Lưu ({aiWords.filter(w => w.include).length} từ)</Button></Space></div>) : null}>
        {!aiGenerated ? (
          <div>
            <div style={{ marginBottom: 8, color: '#555', fontSize: 13 }}>Nhập danh sách từ cách nhau bằng dấu phẩy hoặc xuống dòng (tối đa 30 từ)</div>
            <Input.TextArea rows={6} placeholder="persevere, eloquent, ambiguous&#10;paramount, coherent, diligent&#10;meticulous, scrutinize, advocate" value={aiInputText} onChange={(e) => setAiInputText(e.target.value)} style={{ borderRadius: 8, fontFamily: 'Inter, monospace', fontSize: 13 }} />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Button type="primary" size="large" icon={aiLoading ? <Spin size="small" /> : <ThunderboltOutlined />} onClick={handleAIGenerate} loading={aiLoading} style={{ borderRadius: 10, paddingInline: 32, height: 44 }}>{aiLoading ? 'Đang tạo...' : 'Tạo bằng AI ✨'}</Button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 12, padding: '8px 12px', backgroundColor: '#f0f0ff', borderRadius: 8, fontSize: 13, color: '#1677ff' }}>✨ AI đã tạo {aiWords.length} từ. Vui lòng xem lại và chọn từ muốn lưu.</div>
            <Table dataSource={aiWords} rowKey="_key" size="small" pagination={false} scroll={{ y: 400 }} rowClassName={(record) => record.include ? '' : 'opacity-50'} columns={[
              { title: <Checkbox checked={aiWords.length > 0 && aiWords.every(w => w.include)} onChange={(e) => setAiWords(prev => prev.map(w => ({ ...w, include: e.target.checked })))} />, key: 'include', width: 50, render: (_, record) => <Checkbox checked={record.include} onChange={() => setAiWords(prev => prev.map(w => w._key === record._key ? { ...w, include: !w.include } : w))} /> },
              { title: 'Từ vựng', dataIndex: 'word', key: 'word', render: (w) => <strong>{w}</strong> },
              { title: 'Phiên âm', dataIndex: 'phonetic', key: 'phonetic', render: (p) => <span style={{ color: '#888', fontStyle: 'italic', fontSize: 12 }}>{p}</span> },
              { title: 'Nghĩa tiếng Việt', dataIndex: 'vietnameseMeaning', key: 'meaning' },
              { title: 'Định nghĩa', dataIndex: 'definitionText', key: 'definition', render: (d) => <span style={{ color: '#666', fontSize: 12 }}>{d}</span> },
              { title: 'Loại từ', dataIndex: 'type', key: 'type', render: (t) => <Tag color="blue" style={{ borderRadius: 20, fontSize: 11 }}>{t}</Tag> }
            ]} />
          </div>
        )}
      </Modal>
    </div>
  );
}
