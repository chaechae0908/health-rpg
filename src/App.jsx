import React, { useState, useEffect, useRef } from 'react';
import { Shield, Heart, Brain, Users, ScrollText, LogOut, Plus, Star, BookOpen, X, ArrowLeft, Upload, CheckCircle2, XCircle, Trash2, AlertTriangle, Edit2, CheckSquare, Gift, Package, Lock, Music, VolumeX } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc,
  updateDoc, 
  deleteDoc,
  query, 
  where,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  arrayUnion
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC_8sSs9hMFGShwQXHSvbVMp4zkLcWQ17o",
  authDomain: "chaechae-1e084.firebaseapp.com",
  projectId: "chaechae-1e084",
  storageBucket: "chaechae-1e084.firebasestorage.app",
  messagingSenderId: "328619362675",
  appId: "1:328619362675:web:5fc3f6bb08f119401edd06",
  measurementId: "G-YY2TWYBW0N"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const HERO_ASSETS = {
  '꼬마 새싹': { characterImage: '/images/jaram_stage1_baby.png', backgroundImage: '/images/bg_forest.jpg', description: '건강한 습관을 막 시작한 귀여운 꼬마 새싹 자람이입니다.' },
  '수습 용사': { characterImage: '/images/jaram_stage2_apprentice.png', backgroundImage: '/images/bg_forest.jpg', description: '작은 나무 검을 들고 모험을 시작한 용기 있는 수습 용사 자람이입니다.' },
  '전사': { characterImage: '/images/jaram_stage3_warrior.png', backgroundImage: '/images/bg_warrior_camp.jpg', description: '매일 꾸준히 체력을 단련하여 수호자가 된 늠름한 전사 자람이입니다.' },
  '성기사': { characterImage: '/images/jaram_stage3_paladin.png', backgroundImage: '/images/bg_paladin_temple.jpg', description: '친구를 돕는 친절함으로 신비로운 꽃을 피워낸 성기사 자람이입니다.' },
  '마법사': { characterImage: '/images/jaram_stage3_mage.png', backgroundImage: '/images/bg_mage_library.jpg', description: '명상과 올바른 마음가짐으로 마력의 잎사귀를 얻은 지적인 마법사 자람이입니다.' },
  '마검사': { characterImage: '/images/jaram_stage3_spellsword.png', backgroundImage: '/images/bg_magic_ruins.jpg', description: '강인한 육체와 정신력을 모두 단련하여 마법과 검을 동시에 부리는 마검사 자람이입니다.' },
  '정령술사': { characterImage: '/images/jaram_stage3_spiritbard.png', backgroundImage: '/images/bg_spirit_glade.jpg', description: '깊은 생각과 따뜻한 소통 능력을 갖추어 숲속 정령들의 연주자가 된 정령술사 자람이입니다.' },
  '수호대장': { characterImage: '/images/jaram_stage3_guardian.png', backgroundImage: '/images/bg_castle_courtyard.jpg', description: '튼튼한 몸과 훌륭한 협동성으로 동료들을 앞장서서 지켜주는 수호대장 자람이입니다.' },
  '초월 용사': { characterImage: '/images/jaram_stage4_transcendent.png', backgroundImage: '/images/bg_celestial_garden.jpg', description: '모든 건강 스탯을 완벽하게 수련하여 생명의 비밀을 깨달은 궁극의 초월 용사 자람이입니다.' }
};

const calculateLevel = (str = 0, cha = 0, int = 0) => Math.floor((Number(str) + Number(cha) + Number(int)) / 10) + 1;

const calculateRole = (str = 0, cha = 0, int = 0) => {
  const level = calculateLevel(str, cha, int);
  if (level < 10) return '꼬마 새싹';
  if (level < 30) return '수습 용사';

  const max = Math.max(str, cha, int);
  const min = Math.min(str, cha, int);
  
  const isStrHigh = max - str <= 5;
  const isChaHigh = max - cha <= 5;
  const isIntHigh = max - int <= 5;

  if (level >= 50 && (max - min <= 5)) return '초월 용사';
  if (isStrHigh && isIntHigh) return '마검사';
  if (isIntHigh && isChaHigh) return '정령술사';
  if (isStrHigh && isChaHigh) return '수호대장';
  if (max === str) return '전사';
  if (max === cha) return '성기사';
  return '마법사';
};

const generateClassCode = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const SparkleTrail = () => {
  useEffect(() => {
    let lastTime = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastTime < 40) return; 
      lastTime = now;
      const sparkle = document.createElement('div');
      sparkle.innerHTML = '✨';
      sparkle.className = 'pointer-events-none fixed text-yellow-300 text-lg md:text-xl z-[99999] drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]';
      sparkle.style.left = (e.clientX - 10) + 'px';
      sparkle.style.top = (e.clientY - 10) + 'px';
      sparkle.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
      document.body.appendChild(sparkle);
      void sparkle.offsetWidth;
      sparkle.style.opacity = '0';
      sparkle.style.transform = `translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 + 30}px) rotate(${Math.random() * 180}deg) scale(0.5)`;
      setTimeout(() => sparkle.remove(), 1000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return null;
};

// 실시간 동기화를 위한 입력 컴포넌트 (새로 추가됨)
const StatInput = ({ value, onSave, className }) => {
  const [localVal, setLocalVal] = useState(value);
  
  useEffect(() => {
    setLocalVal(value); // Firebase에서 새 값이 오면 즉시 화면 갱신!
  }, [value]);

  return (
    <input
      type="number"
      value={localVal === undefined ? '' : localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={() => {
        if (Number(localVal) !== Number(value)) {
          onSave(localVal); // 마우스가 칸 밖으로 나갈 때만 서버에 저장
        }
      }}
      className={className}
    />
  );
};

export default function App() {
  const [view, setView] = useState('landing'); 
  const [isTeacherSignUp, setIsTeacherSignUp] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); 
  const [userRole, setUserRole] = useState(null); 
  const [userData, setUserData] = useState(null); 
  
  const [students, setStudents] = useState([]);
  const [quests, setQuests] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [requests, setRequests] = useState([]);

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState('studentManagement');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [studentTab, setStudentTab] = useState('home'); 
  const [showQuestSubmit, setShowQuestSubmit] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [questImageBase64, setQuestImageBase64] = useState('');
  const [selectedClassGroup, setSelectedClassGroup] = useState('All');
  const [editingQuest, setEditingQuest] = useState(null);
  const [editingShopItem, setEditingShopItem] = useState(null);
  const [showPwdModal, setShowPwdModal] = useState(false);

  const [showDailyGift, setShowDailyGift] = useState(false);
  const [dailyGifts, setDailyGifts] = useState([]);
  const [isGiftOpening, setIsGiftOpening] = useState(false);
  const [selectedGiftIndex, setSelectedGiftIndex] = useState(null);
  const [openedGift, setOpenedGift] = useState(null);

  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isConfirm: false });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  // 레벨업 및 스탯 분배 상태
  const [isLevelUpPending, setIsLevelUpPending] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ newLevel: 1, totalPoints: 0 });
  const [statPointsToDistribute, setStatPointsToDistribute] = useState({ str: 0, cha: 0, int: 0, pointsLeft: 0 });

  const customAlert = (title, message) => setAlertModal({ isOpen: true, title, message, onConfirm: null, isConfirm: false });
  const customConfirm = (title, message, onConfirm) => setAlertModal({ isOpen: true, title, message, onConfirm, isConfirm: true });

  let savedClassCode = '';
  try { savedClassCode = localStorage.getItem('health_rpg_classCode') || ''; } catch(e) {}

  useEffect(() => {
    const checkStudentSession = async () => {
       try {
         const studentId = localStorage.getItem('health_rpg_studentId');
         if (studentId) {
            const docRef = doc(db, "students", studentId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
               setUserRole('student');
               setUserData({ id: docSnap.id, ...docSnap.data() });
               setView('student');
               return true;
            }
         }
       } catch(e) { console.error(e); }
       return false;
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const teacherDoc = await getDoc(doc(db, "teachers", user.uid));
        if (teacherDoc.exists()) {
          setUserRole('teacher');
          setUserData({ id: user.uid, ...teacherDoc.data() });
          setView('teacher');
        }
      } else {
        setCurrentUser(null);
        const isStudent = await checkStudentSession();
        if (!isStudent) {
          setUserRole(null);
          setUserData(null);
          setView('landing');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const classCode = userData?.classCode;
  const userId = userData?.id;

  // 🌟 (버그 수정 완료) 안전한 레벨업 로직 (데일리 기프트가 끝난 후 작동!)
  useEffect(() => {
    if (view === 'student' && userData && userData.id && !isLevelUpPending && !showDailyGift) { 
      try {
        const actualLevel = calculateLevel(userData.str, userData.cha, userData.int);
        const lastClaimed = Number(userData.lastClaimedLevel) || 1;
        
        // 실제 레벨이 보상받은 레벨보다 크다면 창을 띄웁니다!
        if (actualLevel > lastClaimed) {
          const levelsGained = actualLevel - lastClaimed; 
          const totalPointsToGive = levelsGained * 3;     
          
          setLevelUpData({ newLevel: actualLevel, totalPoints: totalPointsToGive });
          setStatPointsToDistribute({ str: 0, cha: 0, int: 0, pointsLeft: totalPointsToGive });
          setIsLevelUpPending(true); 
        }
      } catch (error) {
        console.error("레벨업 체크 중 오류 발생:", error);
      }
    }
  }, [userData, view, isLevelUpPending, showDailyGift]); 

  useEffect(() => {
    if (view === 'student' && userData && userData.id) {
      const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
      if (userData.lastLoginDate !== today && !showDailyGift && !openedGift) {
        const types = ['str', 'cha', 'int', 'coins'];
        const generated = [];
        for (let i = 0; i < 4; i++) {
          generated.push({ type: types[Math.floor(Math.random() * types.length)], value: Math.floor(Math.random() * 10) + 1, isDud: false });
        }
        generated.push({ type: 'dud', value: 0, isDud: true });
        generated.sort(() => Math.random() - 0.5);
        setDailyGifts(generated);
        setShowDailyGift(true);
      }
    }
  }, [view, userData, showDailyGift, openedGift]);

  useEffect(() => {
    if (view === 'teacher' && classCode) {
      const unsub1 = onSnapshot(query(collection(db, "students"), where("classCode", "==", classCode)), (snapshot) => {
        setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => Number(a.studentNumber) - Number(b.studentNumber)));
      });
      const unsub2 = onSnapshot(query(collection(db, "quests"), where("classCode", "==", classCode)), (snapshot) => {
        setQuests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      const unsub3 = onSnapshot(query(collection(db, "shopItems"), where("classCode", "==", classCode)), (snapshot) => {
        setShopItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      const unsub4 = onSnapshot(query(collection(db, "requests"), where("classCode", "==", classCode)), (snapshot) => {
        setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => b.createdAt - a.createdAt));
      });
      return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
    }
  }, [view, classCode]);

  useEffect(() => {
    if (view === 'student' && classCode) {
       const unsubQuests = onSnapshot(query(collection(db, "quests"), where("classCode", "==", classCode)), (snapshot) => {
        setQuests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
       });
       const unsubShop = onSnapshot(query(collection(db, "shopItems"), where("classCode", "==", classCode)), (snapshot) => {
        setShopItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
       });
       return () => { unsubQuests(); unsubShop(); };
    }
  }, [view, classCode]);

  useEffect(() => {
    if (view === 'student' && userId) {
       const unsubMe = onSnapshot(doc(db, "students", userId), (docSnap) => {
         if(docSnap.exists()) setUserData({ id: docSnap.id, ...docSnap.data() });
       });
       return () => unsubMe();
    }
  }, [view, userId]);

  useEffect(() => {
    if (view === 'student' && userData?.notifications && userData.notifications.length > 0) {
      const messages = userData.notifications.map(n => n.message).join('\n\n');
      customConfirm('🔔 선생님 알림 도착', messages, async () => {
        await updateDoc(doc(db, "students", userData.id), { notifications: [] });
      });
    }
  }, [userData?.notifications, view]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) { audioRef.current.pause(); } else { audioRef.current.play().catch(e => console.error("음악 재생 오류:", e)); }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleImageChange = (e, setBase64) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800; 
        let width = img.width; let height = img.height;
        if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
        else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setBase64(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleTeacherAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const email = e.target.email.value;
    const password = e.target.password.value;
    const name = isTeacherSignUp ? e.target.name.value : null;
    try {
      if (isTeacherSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newClassCode = generateClassCode();
        await setDoc(doc(db, "teachers", userCredential.user.uid), { email, name, classCode: newClassCode, createdAt: serverTimestamp() });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) { setErrorMsg(`에러: ${error.message}`); }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const inputClassCode = e.target.classCode.value.toUpperCase();
    const studentNumber = e.target.studentId.value;
    const password = e.target.password.value;
    try {
      const q = query(collection(db, "students"), where("classCode", "==", inputClassCode), where("studentNumber", "==", studentNumber));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) { setErrorMsg('학급 코드 또는 학번이 올바르지 않습니다.'); return; }
      const studentDoc = querySnapshot.docs[0];
      const studentInfo = studentDoc.data();
      if (studentInfo.password !== password) { setErrorMsg('비밀번호가 일치하지 않습니다.'); return; }
      
      try {
        localStorage.setItem('health_rpg_classCode', inputClassCode);
        localStorage.setItem('health_rpg_studentId', studentDoc.id);
      } catch(e) {}
      setUserRole('student');
      setUserData({ id: studentDoc.id, ...studentInfo });
      setView('student');
    } catch (error) { setErrorMsg(`에러: ${error.message}`); }
  };

  const handleLogout = () => {
    try { localStorage.removeItem('health_rpg_studentId'); } catch(e) {}
    if (audioRef.current) { audioRef.current.pause(); setIsMusicPlaying(false); }
    signOut(auth);
    setUserRole(null);
    setUserData(null);
    setView('landing');
  };

  const handleOpenGift = async (index) => {
    if (isGiftOpening) return;
    setIsGiftOpening(true);
    setSelectedGiftIndex(index);
    const gift = dailyGifts[index];
    setTimeout(async () => {
      setOpenedGift(gift);
      const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
      const updateData = { lastLoginDate: today };
      if (!gift.isDud) { updateData[gift.type] = (Number(userData[gift.type]) || 0) + gift.value; }
      await updateDoc(doc(db, "students", userData.id), updateData);
    }, 1500);
  };

  const getClassGroup = (studentNumber) => {
    if (!studentNumber || String(studentNumber).length < 3) return '기타';
    const grade = String(studentNumber).substring(0, 1);
    const cls = String(studentNumber).substring(1, 3).replace(/^0+/, '');
    return `${grade}-${cls}`;
  };

  const classGroups = ['All', ...new Set(students.map(s => getClassGroup(s.studentNumber)))].sort();
  const filteredStudents = selectedClassGroup === 'All' ? students : students.filter(s => getClassGroup(s.studentNumber) === selectedClassGroup);

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedStudents(filteredStudents.map(s => s.id));
    else setSelectedStudents([]);
  };

  const toggleSelect = (id) => { setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); };

  const checkDuplicate = (num, name, excludeId = null) => {
    return students.find(s => s.id !== excludeId && (String(s.studentNumber).trim() === String(num).trim() || String(s.name).trim() === String(name).trim()));
  };

  const handleUpdateStat = async (id, field, value) => { await updateDoc(doc(db, "students", id), { [field]: Number(value) }); };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const num = e.target.studentNumber.value;
    const name = e.target.studentName.value;
    const pwd = e.target.password.value;
    const dup = checkDuplicate(num, name);
    if (dup) {
      customConfirm(`⚠️ [중복 알림]`, `이미 동일한 학번(${dup.studentNumber})이나 이름(${dup.name})이 존재합니다.\n그래도 추가하시겠습니까?`, async () => {
        await addDoc(collection(db, "students"), { classCode: userData.classCode, teacherId: userData.id, studentNumber: num, name: name, password: pwd, str: 0, cha: 0, int: 0, coins: 0, lastClaimedLevel: 1, createdAt: serverTimestamp() });
        e.target.reset();
      });
      return;
    }
    await addDoc(collection(db, "students"), { classCode: userData.classCode, teacherId: userData.id, studentNumber: num, name: name, password: pwd, str: 0, cha: 0, int: 0, coins: 0, lastClaimedLevel: 1, createdAt: serverTimestamp() });
    e.target.reset();
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const buffer = event.target.result;
        let text = new TextDecoder('utf-8').decode(buffer);
        if (!text.includes('학번') && !text.includes('이름')) { text = new TextDecoder('euc-kr').decode(buffer); }
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length <= 1) { customAlert('오류', '유효한 학생 데이터가 없습니다. CSV 양식을 확인해주세요.'); e.target.value = ''; return; }
        const headers = lines[0].split(',').map(h => h.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF"]+|"$/g, "").trim());
        const validRows = [];
        let dupCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length < 3) continue;
          const row = {};
          headers.forEach((header, index) => { row[header] = (values[index] || '').replace(/^"|"$/g, "").trim(); });
          const getVal = (keyword) => { const key = Object.keys(row).find(k => k.includes(keyword)); return key ? row[key] : ''; };
          const sNum = getVal('학번'); const sName = getVal('이름'); const sPwd = getVal('비밀'); 
          if (sNum && sName && sPwd) { if (checkDuplicate(sNum, sName)) dupCount++; validRows.push({ sNum, sName, sPwd }); }
        }
        const proceedUpload = async () => {
          if (validRows.length === 0) { customAlert('오류', '등록할 수 있는 데이터가 없습니다.\n첫 줄에 [학번, 이름, 비밀번호]가 정확히 적혀있는지 확인해주세요.'); e.target.value = ''; return; }
          const batch = writeBatch(db);
          validRows.forEach(r => {
             const newRef = doc(collection(db, "students"));
             batch.set(newRef, { classCode: userData.classCode, teacherId: userData.id, studentNumber: r.sNum, name: r.sName, password: r.sPwd, str: 0, cha: 0, int: 0, coins: 0, lastClaimedLevel: 1, createdAt: serverTimestamp() });
          });
          await batch.commit();
          customAlert('업로드 완료', `${validRows.length}명의 학생이 성공적으로 일괄 등록되었습니다.`);
          e.target.value = '';
        };
        if (dupCount > 0) { customConfirm(`⚠️ 중복 알림`, `업로드 명단 중 ${dupCount}명이 기존 학번 또는 이름과 중복됩니다.\n중복을 무시하고 그대로 모두 추가하시겠습니까?`, proceedUpload); } else { proceedUpload(); }
      } catch (error) { console.error(error); customAlert('오류', '파일을 읽는 중 문제가 발생했습니다. 엑셀에서 다시 CSV로 저장해 보세요.'); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDeleteStudent = (studentId) => {
    customConfirm('학생 삭제', '정말 이 학생을 삭제하시겠습니까?', async () => {
      await deleteDoc(doc(db, "students", studentId));
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
      customAlert('삭제 완료', '학생 정보가 정상적으로 삭제되었습니다.');
    });
  };

  const handleBatchDelete = () => {
    if (selectedStudents.length === 0) return customAlert('알림', '선택된 학생이 없습니다.');
    customConfirm('일괄 삭제', `⚠️ 선택한 ${selectedStudents.length}명의 학생을 정말 모두 삭제하시겠습니까?`, async () => {
      const batch = writeBatch(db);
      selectedStudents.forEach(id => batch.delete(doc(db, "students", id)));
      await batch.commit();
      setSelectedStudents([]);
      customAlert('삭제 완료', '선택한 학생들이 삭제되었습니다.');
    });
  };

  const handleRequestAction = async (req, isApproved) => {
    const studentDocRef = doc(db, "students", req.studentDocId);
    const studentSnap = await getDoc(studentDocRef);
    const notifMsg = isApproved ? `[${req.targetName}] 요청이 승인되었습니다! 🎉` : `[${req.targetName}] 요청이 반려되었습니다. 🥲`;
    const notification = { id: Date.now().toString(), message: notifMsg, timestamp: new Date().getTime() };

    if (isApproved && studentSnap.exists()) {
      const sData = studentSnap.data();
      if (req.type === 'quest') {
        const currentStat = Number(sData[req.rewardStat.toLowerCase()]) || 0;
        await updateDoc(studentDocRef, { [req.rewardStat.toLowerCase()]: currentStat + Number(req.rewardAmount), notifications: arrayUnion(notification) });
      } else if (req.type === 'use_item') {
        await updateDoc(studentDocRef, { notifications: arrayUnion(notification) });
      }
    } else if (!isApproved && studentSnap.exists()) {
      const sData = studentSnap.data();
      if (req.type === 'use_item') {
        const currentInv = sData.inventory || {};
        const currentItem = currentInv[req.targetId] || { name: req.targetName, quantity: 0 };
        await updateDoc(studentDocRef, { [`inventory.${req.targetId}`]: { name: req.targetName, quantity: currentItem.quantity + 1 }, notifications: arrayUnion(notification) });
      } else {
        await updateDoc(studentDocRef, { notifications: arrayUnion(notification) });
      }
    }
    await updateDoc(doc(db, "requests", req.id), { status: isApproved ? 'approved' : 'rejected' });
  };

  const handleAddQuest = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "quests"), { classCode: userData.classCode, title: e.target.title.value, stat: e.target.stat.value, reward: Number(e.target.reward.value), createdAt: serverTimestamp() });
    e.target.reset();
  };

  const handleUpdateQuest = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "quests", editingQuest.id), { title: e.target.title.value, stat: e.target.stat.value, reward: Number(e.target.reward.value) });
    setEditingQuest(null);
    customAlert('수정 완료', '퀘스트가 성공적으로 수정되었습니다.');
  };

  const handleDeleteQuest = async (id) => { await deleteDoc(doc(db, "quests", id)); };

  const handleAddShopItem = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "shopItems"), { classCode: userData.classCode, name: e.target.name.value, price: Number(e.target.price.value), stock: Number(e.target.stock.value), createdAt: serverTimestamp() });
    e.target.reset();
  };

  const handleUpdateShopItem = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "shopItems", editingShopItem.id), { name: e.target.name.value, price: Number(e.target.price.value), stock: Number(e.target.stock.value) });
    setEditingShopItem(null);
    customAlert('수정 완료', '상품 정보와 재고가 수정되었습니다.');
  };

  const handleDeleteShopItem = async (id) => { await deleteDoc(doc(db, "shopItems", id)); };

  const handleInventoryAdjust = async (studentId, itemId, itemName, currentQty, adjustAmount) => {
    const newQty = Math.max(0, currentQty + adjustAmount);
    await updateDoc(doc(db, "students", studentId), { [`inventory.${itemId}`]: { name: itemName, quantity: newQty } });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const currentPwd = e.target.currentPwd.value;
    const newPwd = e.target.newPwd.value;
    const confirmPwd = e.target.confirmPwd.value;
    if (currentPwd !== userData.password) return customAlert('오류', '현재 비밀번호가 일치하지 않습니다.');
    if (newPwd !== confirmPwd) return customAlert('오류', '새 비밀번호가 일치하지 않습니다.');
    await updateDoc(doc(db, "students", userData.id), { password: newPwd });
    setShowPwdModal(false);
    customAlert('변경 완료', '비밀번호가 성공적으로 변경되었습니다.');
  };

  const handleQuestSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    await addDoc(collection(db, "requests"), { classCode: userData.classCode, studentDocId: userData.id, studentId: userData.studentNumber, studentName: userData.name, type: 'quest', targetId: selectedQuest.id, targetName: selectedQuest.title, rewardStat: selectedQuest.stat, rewardAmount: selectedQuest.reward, submittedText: text, submittedImageUrl: questImageBase64, status: 'pending', createdAt: serverTimestamp() });
    setShowQuestSubmit(false); setSelectedQuest(null); setQuestImageBase64('');
    customAlert('제출 완료', '선생님께 퀘스트 검토를 요청했습니다!');
  };

  const handleBuyItem = async (item) => {
    if (Number(userData.coins) < Number(item.price)) return customAlert('잔액 부족', '보유한 씨앗(코인)이 부족합니다!');
    if (Number(item.stock) <= 0) return customAlert('품절', '해당 상품의 재고가 모두 소진되었습니다.');
    customConfirm('아이템 구매', `'${item.name}' 상품을 구매하시겠습니까?\n(씨앗 ${item.price}개 차감)`, async () => {
      const batch = writeBatch(db);
      const itemRef = doc(db, "shopItems", item.id);
      batch.update(itemRef, { stock: Number(item.stock) - 1 });
      const studentRef = doc(db, "students", userData.id);
      const currentInventory = userData.inventory || {};
      const currentItemInInv = currentInventory[item.id] || { name: item.name, quantity: 0 };
      batch.update(studentRef, { coins: Number(userData.coins) - Number(item.price), [`inventory.${item.id}`]: { name: item.name, quantity: currentItemInInv.quantity + 1 } });
      await batch.commit();
      customAlert('구매 완료', `'${item.name}'을(를) 성공적으로 구매했습니다!\n'나의 보관함' 탭에서 확인해 보세요.`);
    });
  };

  const handleUseItemRequest = (itemId, itemInfo) => {
    customConfirm('사용 요청', `'${itemInfo.name}' 아이템을 사용하시겠습니까?\n선생님께 사용 요청이 전송되며, 수량이 1개 차감됩니다.`, async () => {
      const batch = writeBatch(db);
      const studentRef = doc(db, "students", userData.id);
      batch.update(studentRef, { [`inventory.${itemId}.quantity`]: itemInfo.quantity - 1 });
      const reqRef = doc(collection(db, "requests"));
      batch.set(reqRef, { classCode: userData.classCode, studentDocId: userData.id, studentId: userData.studentNumber, studentName: userData.name, type: 'use_item', targetId: itemId, targetName: itemInfo.name, status: 'pending', createdAt: serverTimestamp() });
      await batch.commit();
      customAlert('요청 완료', '선생님께 아이템 사용을 요청했습니다.');
    });
  };

  const adjustStatPoint = (stat, amount) => {
    setStatPointsToDistribute(prev => {
      if (amount > 0 && prev.pointsLeft > 0) {
        return { ...prev, [stat]: prev[stat] + 1, pointsLeft: prev.pointsLeft - 1 };
      } else if (amount < 0 && prev[stat] > 0) {
        return { ...prev, [stat]: prev[stat] - 1, pointsLeft: prev.pointsLeft + 1 };
      }
      return prev;
    });
  };

  const handleStatAllocation = async () => {
    if (statPointsToDistribute.pointsLeft > 0) return; 
    try {
      const newStr = (Number(userData.str) || 0) + statPointsToDistribute.str;
      const newCha = (Number(userData.cha) || 0) + statPointsToDistribute.cha;
      const newInt = (Number(userData.int) || 0) + statPointsToDistribute.int;
      
      const studentRef = doc(db, "students", userData.id);
      
      await updateDoc(studentRef, {
        str: newStr,
        cha: newCha,
        int: newInt,
        lastClaimedLevel: levelUpData.newLevel 
      });
      
      setIsLevelUpPending(false); 
      setStatPointsToDistribute({ str: 0, cha: 0, int: 0, pointsLeft: 0 }); 
    } catch (error) {
      console.error("스탯 분배 중 에러:", error);
      customAlert('오류', '스탯을 분배하는 중 문제가 발생했습니다.');
    }
  };

  const getRoleAnimation = (roleName) => {
    if (!roleName) return '';
    if (roleName === '꼬마 새싹') return 'anim-baby';
    if (roleName === '수습 용사') return 'anim-apprentice';
    if (roleName === '전사') return 'anim-warrior';
    if (roleName === '성기사') return 'anim-paladin';
    if (roleName === '마법사') return 'anim-mage';
    if (roleName === '마검사') return 'anim-spellsword';
    if (roleName === '정령술사') return 'anim-spiritbard';
    if (roleName === '수호대장') return 'anim-guardian';
    if (roleName === '초월 용사') return 'anim-transcendent';
    return ''; 
  };

  const currentLevel = userData ? calculateLevel(userData.str, userData.cha, userData.int) : 1;
  const currentRole = userData ? calculateRole(userData.str, userData.cha, userData.int) : '꼬마 새싹';
  const currentAsset = HERO_ASSETS[currentRole] || HERO_ASSETS['꼬마 새싹']; 
  const maxStat = userData ? Math.max(150, userData.str || 0, userData.cha || 0, userData.int || 0) : 150;
  
  const chartData = userData ? [
    { subject: '체력 (STR)', A: Number(userData.str) || 0, fullMark: maxStat },
    { subject: '친화력 (CHA)', A: Number(userData.cha) || 0, fullMark: maxStat },
    { subject: '정신력 (INT)', A: Number(userData.int) || 0, fullMark: maxStat },
  ] : [];

  const renderAlertModal = () => {
    if (!alertModal.isOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-fadeIn pointer-events-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 m-auto text-left font-sans text-slate-800 pointer-events-auto">
          <h4 className="text-lg font-black mb-2 flex items-center gap-2"><Shield className="text-indigo-500" size={20} /> {alertModal.title}</h4>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed whitespace-pre-line font-sans font-medium">{alertModal.message}</p>
          <div className="flex gap-2 justify-end">
            {alertModal.isConfirm && (
              <button type="button" onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-bold transition cursor-pointer pointer-events-auto">취소</button>
            )}
            <button type="button" onClick={() => { if (alertModal.onConfirm) { alertModal.onConfirm(); } setAlertModal(prev => ({ ...prev, isOpen: false })); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition shadow-md cursor-pointer pointer-events-auto">확인</button>
          </div>
        </div>
      </div>
    );
  };

  const renderGuideModal = () => {
    if (!showGuideModal) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[999998] animate-fadeIn overflow-y-auto pointer-events-auto">
        <div className="bg-white rounded-3xl p-6 md:p-8 relative max-w-3xl w-full shadow-2xl border-4 border-slate-700 m-auto">
          <button onClick={() => setShowGuideModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition bg-slate-100 hover:bg-slate-200 rounded-full p-2 cursor-pointer z-50 pointer-events-auto"><X size={24} /></button>
          
          <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-2 border-b-2 border-slate-100 pb-4"><BookOpen className="text-emerald-500"/> 진화 가이드북</h2>
          
          {/* 🌟 1. 타임라인형 성장의 길 */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 relative overflow-hidden">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Star className="text-yellow-500" size={18}/> 자람이 성장의 길 (총 스탯 기준)</h3>
            <div className="relative flex justify-between items-center px-2 md:px-6">
              <div className="absolute left-6 right-6 top-1/2 h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
              {[ { point: '0+', label: '꼬마 새싹\n(Lv.1~9)' }, { point: '90+', label: '수습 용사\n(Lv.10~29)' }, { point: '290+', label: '전문 직업\n(Lv.30~)' }, { point: '490+', label: '초월 용사\n(Lv.50~)' } ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 bg-slate-50 px-2 z-10">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center font-black text-emerald-600 text-sm shadow-md">{step.point}</div>
                  <span className="text-xs text-slate-600 font-bold text-center whitespace-pre-line">{step.label}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-slate-500 mt-6 bg-white py-2 rounded-lg border border-slate-100">💡 스탯(체력+친화력+정신력) 총합이 <strong className="text-emerald-600">10점</strong> 오를 때마다 1레벨씩 성장합니다.</p>
          </div>

          {/* 🌟 2. 3단계 단일 특화 직업 도감 */}
          <div className="mb-8">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Shield className="text-blue-500" size={18}/> 단일 특화 직업 (Lv.30~ / 스탯 290점 이상)</h3>
            <p className="text-sm text-slate-500 mb-4 ml-1">하나의 스탯을 집중적으로 단련했을 때 전직합니다.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-red-500 overflow-hidden shrink-0"><img src="/images/jaram_stage3_warrior.png" alt="전사" className="w-full h-full object-cover"/></div>
                <div><span className="font-black text-red-600 text-lg block mb-1">전사</span><span className="text-slate-700 text-xs font-bold bg-slate-100 px-2 py-1 rounded">체력(STR) 최고</span></div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-amber-500 overflow-hidden shrink-0"><img src="/images/jaram_stage3_paladin.png" alt="성기사" className="w-full h-full object-cover"/></div>
                <div><span className="font-black text-amber-600 text-lg block mb-1">성기사</span><span className="text-slate-700 text-xs font-bold bg-slate-100 px-2 py-1 rounded">친화력(CHA) 최고</span></div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-blue-500 overflow-hidden shrink-0"><img src="/images/jaram_stage3_mage.png" alt="마법사" className="w-full h-full object-cover"/></div>
                <div><span className="font-black text-blue-600 text-lg block mb-1">마법사</span><span className="text-slate-700 text-xs font-bold bg-slate-100 px-2 py-1 rounded">정신력(INT) 최고</span></div>
              </div>
            </div>
          </div>

          {/* 🌟 3. 3단계 하이브리드 직업 도감 */}
          <div className="mb-8">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Users className="text-purple-500" size={18}/> 융합(하이브리드) 직업 (Lv.30~ / 스탯 290점 이상)</h3>
            <p className="text-sm text-slate-500 mb-4 ml-1">가장 높은 두 스탯의 점수 차이가 <strong className="text-purple-600">5점 이내</strong>로 팽팽할 때 전직합니다.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-blue-50 p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-purple-500 overflow-hidden shrink-0"><img src="/images/jaram_stage3_spellsword.png" alt="마검사" className="w-full h-full object-cover"/></div>
                <div><span className="font-black text-purple-700 text-lg block mb-1">마검사</span><span className="text-slate-700 text-xs font-bold bg-white px-2 py-1 rounded">체력 + 정신력</span></div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-amber-50 p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-teal-500 overflow-hidden shrink-0"><img src="/images/jaram_stage3_spiritbard.png" alt="정령술사" className="w-full h-full object-cover"/></div>
                <div><span className="font-black text-teal-700 text-lg block mb-1">정령술사</span><span className="text-slate-700 text-xs font-bold bg-white px-2 py-1 rounded">정신력 + 친화력</span></div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-amber-50 p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-orange-500 overflow-hidden shrink-0"><img src="/images/jaram_stage3_guardian.png" alt="수호대장" className="w-full h-full object-cover"/></div>
                <div><span className="font-black text-orange-700 text-lg block mb-1">수호대장</span><span className="text-slate-700 text-xs font-bold bg-white px-2 py-1 rounded">체력 + 친화력</span></div>
              </div>
            </div>
          </div>

          {/* 🌟 4. 최종 초월 용사 도감 */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-2xl border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)] flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-yellow-400 overflow-hidden shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.6)]"><img src="/images/jaram_stage4_transcendent.png" alt="초월 용사" className="w-full h-full object-cover"/></div>
            <div>
              <span className="font-black text-yellow-400 text-xl flex items-center gap-2 mb-2">👑 초월 용사 (Lv.50~ / 스탯 490점 이상)</span>
              <p className="text-sm text-slate-200 leading-relaxed font-bold">
                세 가지 스탯(STR, CHA, INT)의 최댓값과 최솟값 차이가 <strong className="text-yellow-300">5점 이내</strong>로 완벽한 밸런스를 이룰 때만 진화할 수 있는 궁극의 형태입니다. 신비로운 <strong className="text-yellow-300">천상의 정원</strong> 배경을 획득합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes animBaby { 0%, 100% { transform: translateY(0) scale(1, 1) rotate(0deg); } 20% { transform: translateY(0) scale(1.05, 0.95) rotate(-3deg); } 30% { transform: translateY(0) scale(1.08, 0.92) rotate(3deg); } 40% { transform: translateY(-25px) scale(0.95, 1.05) rotate(0deg); } 50% { transform: translateY(-28px) scale(1, 1); } 60% { transform: translateY(0) scale(0.92, 1.08); } 70% { transform: translateY(0) scale(1.04, 0.96); } 80% { transform: translateY(0) scale(1, 1); } }
          .anim-baby { animation: animBaby 3.2s cubic-bezier(0.25, 1, 0.5, 1) infinite; transform-origin: bottom center; }
          @keyframes animApprentice { 0%, 100% { transform: translateY(0) scale(1, 1); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05)); } 50% { transform: translateY(-6px) scale(0.98, 1.02); filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1)); } }
          .anim-apprentice { animation: animApprentice 3s ease-in-out infinite; transform-origin: bottom center; }
          @keyframes animGuardian { 0%, 100% { transform: translateY(0); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); } 40% { transform: translateY(-4px); } 50% { transform: translateY(0); filter: drop-shadow(0 10px 20px rgba(34, 197, 94, 0.6)); } }
          .anim-guardian { animation: animGuardian 4s ease-in-out infinite; transform-origin: bottom center; }
          @keyframes animWarrior { 0%, 100% { transform: translateY(0) scale(1, 1); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); } 45% { transform: translateY(3px) scale(1.02, 0.98); } 50% { filter: brightness(1.1) drop-shadow(0 0 15px rgba(250, 204, 21, 0.7)); } 55% { filter: brightness(1); } }
          .anim-warrior { animation: animWarrior 3s ease-in-out infinite; transform-origin: bottom center; }
          @keyframes animMage { 0%, 100% { transform: translateY(0); filter: drop-shadow(0 8px 12px rgba(59, 130, 246, 0.4)); } 50% { transform: translateY(-15px); filter: drop-shadow(0 25px 30px rgba(139, 92, 246, 0.7)) brightness(1.2); } }
          .anim-mage { animation: animMage 3.5s ease-in-out infinite; }
          @keyframes animPaladin { 0%, 100% { transform: translateY(0); filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15)); } 50% { transform: translateY(-5px); filter: drop-shadow(0 -15px 30px rgba(255, 250, 200, 0.8)) brightness(1.1); } }
          .anim-paladin { animation: animPaladin 4.5s ease-in-out infinite; transform-origin: bottom center; }
          @keyframes animSpellsword { 0%, 100% { transform: translateY(0); filter: drop-shadow(0 5px 10px rgba(168, 85, 247, 0.5)); } 50% { transform: translateY(-6px); filter: drop-shadow(0 15px 30px rgba(236, 72, 153, 0.8)) hue-rotate(15deg); } }
          .anim-spellsword { animation: animSpellsword 3.8s ease-in-out infinite; transform-origin: bottom center; }
          @keyframes animSpiritbard { 0%, 100% { transform: translateY(0) rotate(0deg); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); } 33% { transform: translateY(-5px) rotate(1.5deg); filter: drop-shadow(0 8px 18px rgba(134, 239, 172, 0.6)); } 66% { transform: translateY(-2px) rotate(-1.5deg); filter: drop-shadow(0 8px 18px rgba(96, 165, 250, 0.6)); } }
          .anim-spiritbard { animation: animSpiritbard 3s ease-in-out infinite; transform-origin: bottom center; }
          @keyframes animTranscendent { 0%, 100% { transform: translateY(0); filter: drop-shadow(0 15px 25px rgba(255,255,255,0.5)) hue-rotate(0deg); } 50% { transform: translateY(-20px); filter: drop-shadow(0 35px 50px rgba(255, 182, 193, 0.9)) brightness(1.2) hue-rotate(180deg); } }
          .anim-transcendent { animation: animTranscendent 5s ease-in-out infinite; }
        `}
      </style>

      {renderAlertModal()}
      {renderGuideModal()}

      {/* --- 안전한 로딩 화면 --- */}
      {((view === 'student' || view === 'teacher') && !userData) && (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[99999]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500"></div>
        </div>
      )}

      {/* --- BGM 및 트레일 효과 --- */}
      {view === 'student' && userData && (
        <>
          <SparkleTrail />
          <audio ref={audioRef} src="/my_bgm.mp3" loop preload="auto" />
        </>
      )}

      {/* --- 1. 랜딩 페이지 --- */}
      {view === 'landing' && (
        <div className="min-h-screen w-full relative font-sans text-slate-800 flex flex-col z-0">
          <div className="fixed inset-0 w-full h-full pointer-events-none z-[-20]" style={{ backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.70), rgba(15, 23, 42, 0.70)), url('/images/bg_forest.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
          <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-center p-4 md:p-8">
            <div className="bg-[#2a2f4c]/90 p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-slate-700/50 backdrop-blur-md mx-auto relative z-10 pointer-events-auto">
              <div className="flex justify-center mb-6"><Shield size={64} className="text-emerald-400 drop-shadow-lg" /></div>
              <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-md">건강지킴이 RPG</h1>
              <p className="text-emerald-200/80 mb-10 font-medium">Bloom Forest Adventure</p>
              <div className="space-y-4">
                <button onClick={() => setView('login_student')} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg py-4 px-4 rounded-xl transition shadow-lg cursor-pointer">학생 입장하기</button>
                <button onClick={() => setView('login_teacher')} className="w-full bg-[#3f466b] hover:bg-[#4b537c] text-white font-bold text-lg py-4 px-4 rounded-xl transition shadow-lg cursor-pointer">선생님 (관리자)</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. 로그인 페이지 --- */}
      {(view === 'login_student' || view === 'login_teacher') && (
        <div className="min-h-screen w-full relative font-sans text-slate-800 flex flex-col z-0">
          <div className="fixed inset-0 w-full h-full pointer-events-none z-[-20]" style={{ backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.70), rgba(15, 23, 42, 0.70)), url('/images/bg_forest.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
          <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-md mx-auto relative mt-16 z-10 pointer-events-auto">
              <button onClick={() => {setView('landing'); setErrorMsg('');}} className="absolute -top-16 left-0 text-slate-300 hover:text-white flex items-center gap-2 transition bg-black/30 px-4 py-2 rounded-xl backdrop-blur-md cursor-pointer">
                <ArrowLeft size={20}/> 뒤로 가기
              </button>
              <div className={`bg-[#2a2f4c]/95 p-8 rounded-3xl shadow-2xl w-full border backdrop-blur-md ${view === 'login_student' ? 'border-emerald-500/30' : 'border-blue-500/30'}`}>
                <h2 className={`text-2xl font-bold mb-2 text-center flex flex-col items-center gap-2 ${view === 'login_student' ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {view === 'login_student' ? '숲속 포털 입장' : (isTeacherSignUp ? '선생님 회원가입' : '선생님 로그인')}
                </h2>
                {view === 'login_teacher' && <p className="text-center text-slate-400 text-sm mb-6">학급 진화 게임을 개설하고 관리합니다.</p>}
                {view === 'login_student' && <p className="text-center text-slate-400 text-sm mb-6">선생님이 나눠주신 열쇠로 모험을 시작하세요.</p>}
                
                <form onSubmit={view === 'login_student' ? handleStudentLogin : handleTeacherAuth} className="space-y-4">
                  {view === 'login_student' ? (
                    <>
                      <div><label className="block text-sm font-medium text-emerald-200/70 mb-1">학급 코드 (6자리)</label><input type="text" name="classCode" defaultValue={savedClassCode} required placeholder="예: UNFUPY" className="w-full bg-[#1c2136] text-white border border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 uppercase transition" /></div>
                      <div><label className="block text-sm font-medium text-emerald-200/70 mb-1">학번</label><input type="text" name="studentId" required placeholder="예: 10101" className="w-full bg-[#1c2136] text-white border border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition" /></div>
                      <div><label className="block text-sm font-medium text-emerald-200/70 mb-1">비밀번호</label><input type="password" name="password" required placeholder="비밀번호 입력" className="w-full bg-[#1c2136] text-white border border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition" /></div>
                    </>
                  ) : (
                    <>
                      <div className="flex border-b border-slate-600 mb-6 rounded-lg overflow-hidden bg-[#1c2136]">
                        <button type="button" onClick={() => setIsTeacherSignUp(false)} className={`flex-1 py-2 text-sm font-bold transition cursor-pointer ${!isTeacherSignUp ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>로그인</button>
                        <button type="button" onClick={() => setIsTeacherSignUp(true)} className={`flex-1 py-2 text-sm font-bold transition cursor-pointer ${isTeacherSignUp ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>회원가입</button>
                      </div>
                      {isTeacherSignUp && <div><label className="block text-sm font-medium text-blue-200/70 mb-1">선생님 닉네임</label><input type="text" name="name" required placeholder="예: 홍길동" className="w-full bg-[#1c2136] text-white border border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition" /></div>}
                      <div><label className="block text-sm font-medium text-blue-200/70 mb-1">이메일 주소</label><input type="email" name="email" required placeholder="teacher@school.com" className="w-full bg-[#1c2136] text-white border border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition" /></div>
                      <div><label className="block text-sm font-medium text-blue-200/70 mb-1">비밀번호</label><input type="password" name="password" required placeholder="비밀번호 입력" className="w-full bg-[#1c2136] text-white border border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition" /></div>
                    </>
                  )}
                  {errorMsg && <div className="text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg flex items-center gap-2"><XCircle size={16}/> {errorMsg}</div>}
                  <button type="submit" className={`w-full text-white font-bold py-3 px-4 rounded-xl transition mt-4 shadow-lg cursor-pointer ${view === 'login_student' ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'}`}>
                    {view === 'login_student' ? '모험 시작!' : (isTeacherSignUp ? '신규 학급 개설하기' : '로그인')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 3. 선생님 대시보드 --- */}
      {view === 'teacher' && userData && (
        <div className="min-h-screen w-full bg-slate-100 font-sans text-slate-800 flex flex-col pointer-events-auto">
          <div className="flex-grow w-full max-w-7xl mx-auto space-y-6 p-4 md:p-8 flex flex-col relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border-t-4 border-blue-500 gap-4 shrink-0">
              <div><h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">🏫 {userData.name} 선생님 대시보드</h1></div>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="bg-purple-50 px-4 py-2 rounded-xl border border-purple-200 flex items-center shadow-inner">
                  <span className="text-sm text-purple-800 font-semibold mr-3">학생 입장 코드</span>
                  <span className="text-xl font-black text-purple-600 tracking-widest bg-white px-3 py-1 rounded-lg border border-purple-100 shadow-sm">{userData.classCode}</span>
                </div>
                <button onClick={() => setShowGuideModal(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition text-sm cursor-pointer"><BookOpen size={18} /> 진화 가이드</button>
                <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition ml-2 font-medium text-sm bg-slate-100 hover:bg-red-50 px-3 py-2.5 rounded-xl cursor-pointer"><LogOut size={18} /> 로그아웃</button>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button className={`py-3 px-6 font-bold text-base rounded-t-xl transition cursor-pointer ${activeTab === 'studentManagement' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 border-b-0'}`} onClick={() => setActiveTab('studentManagement')}>학생 및 승인 관리</button>
              <button className={`py-3 px-6 font-bold text-base rounded-t-xl transition cursor-pointer ${activeTab === 'questManagement' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 border-b-0'}`} onClick={() => setActiveTab('questManagement')}>퀘스트 및 상점 관리</button>
            </div>

            <div className="flex-grow w-full pb-10">
              {activeTab === 'studentManagement' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">🔔 승인 대기열</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {requests.filter(r => r.status === 'pending').length === 0 ? (
                        <div className="col-span-full p-8 text-center text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">대기 중인 요청이 없습니다.</div>
                      ) : (
                        requests.filter(r => r.status === 'pending').map(req => (
                          <div key={req.id} className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition">
                            <div>
                              <div className="flex justify-between items-start">
                                <div><span className="text-slate-800 font-bold block">{req.studentName} 용사</span><span className="text-xs text-slate-500">{req.studentId} • {typeof req.createdAt === 'object' && req.createdAt !== null ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : req.createdAt}</span></div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${req.type === 'quest' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}>{req.type === 'quest' ? '퀘스트 수행' : '상점 교환'}</span>
                              </div>
                              <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="text-sm font-bold text-slate-700 block mb-1">{req.targetName}</span>
                                {req.type === 'quest' && <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">보상: {req.rewardStat} +{req.rewardAmount}</span>}
                                {req.type === 'use_item' && <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">요청: 아이템 사용</span>}
                                {req.submittedText && <p className="mt-2 text-sm text-slate-700 break-words bg-white p-2 rounded border border-slate-200 font-sans">"{req.submittedText}"</p>}
                                {req.submittedImageUrl && <div className="mt-2 rounded overflow-hidden border border-slate-200 aspect-video bg-black flex items-center justify-center"><img src={req.submittedImageUrl} alt="제출 이미지" className="max-h-full object-contain" /></div>}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button onClick={() => handleRequestAction(req, true)} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-1 transition cursor-pointer"><CheckCircle2 size={16}/> 승인</button>
                              <button onClick={() => handleRequestAction(req, false)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-1 transition cursor-pointer"><XCircle size={16}/> 반려</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                      <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">🌱 성장의 씨앗 관리 (스탯 부여)</h2>
                      <div className="flex gap-2">
                        <button onClick={() => { if (selectedStudents.length === 0) return customAlert('알림', '선택된 학생이 없습니다. 표 맨 앞의 체크박스를 눌러주세요.'); setShowBatchModal(true); }} className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold transition border border-blue-200 cursor-pointer"><CheckSquare size={16}/> 선택 스탯/씨앗 일괄 부여</button>
                        <button onClick={handleBatchDelete} className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold transition border border-red-200 cursor-pointer"><Trash2 size={16}/> 선택 일괄 삭제</button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {classGroups.map(group => (
                        <button key={group} onClick={() => setSelectedClassGroup(group)} className={`px-4 py-1.5 rounded-full text-sm font-bold transition cursor-pointer ${selectedClassGroup === group ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                          {group === 'All' ? '전체 보기' : `${group}반`}
                        </button>
                      ))}
                    </div>
                    
                    <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[500px] overflow-y-auto">
                      <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="sticky top-0 bg-slate-50 z-20 shadow-sm">
                          <tr className="text-slate-600 border-b border-slate-200 text-sm">
                            <th className="p-3 text-center w-12"><input type="checkbox" onChange={toggleSelectAll} checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0} className="w-4 h-4 cursor-pointer" /></th>
                            <th className="p-3 font-semibold text-center w-20">학번</th><th className="p-3 font-semibold w-24">이름</th><th className="p-3 font-semibold text-center w-32">레벨/직업</th><th className="p-3 font-semibold text-red-500 text-center">체력(STR)</th><th className="p-3 font-semibold text-amber-500 text-center">친화력(CHA)</th><th className="p-3 font-semibold text-blue-500 text-center">정신력(INT)</th><th className="p-3 font-semibold text-emerald-600 text-center">씨앗(코인)</th><th className="p-3 font-semibold text-center w-24">관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.length === 0 && <tr><td colSpan="9" className="p-8 text-center text-slate-400">등록된 학생이 없습니다.</td></tr>}
                          {filteredStudents.map(s => {
                            const lv = calculateLevel(s.str, s.cha, s.int);
                            const r = calculateRole(s.str, s.cha, s.int);
                            return (
                              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="p-3 text-center"><input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => toggleSelect(s.id)} className="w-4 h-4 cursor-pointer" /></td>
                                <td className="p-3 text-center text-sm text-slate-700 font-medium">{s.studentNumber}</td>
                                <td className="p-3 font-bold text-slate-800">{s.name}</td>
                                <td className="p-3 text-center"><div className="flex flex-col items-center gap-1"><span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-bold">Lv.{lv}</span><span className="text-xs font-semibold text-slate-600">{r}</span></div></td>
                                <td className="p-3 text-center"><StatInput value={s.str} onSave={(val) => handleUpdateStat(s.id, 'str', val)} className="w-16 border border-slate-200 rounded p-1 text-center bg-red-50 focus:bg-white outline-none focus:border-red-400 font-bold text-slate-900" /></td>
                                <td className="p-3 text-center"><StatInput value={s.cha} onSave={(val) => handleUpdateStat(s.id, 'cha', val)} className="w-16 border border-slate-200 rounded p-1 text-center bg-amber-50 focus:bg-white outline-none focus:border-amber-400 font-bold text-slate-900" /></td>
                                <td className="p-3 text-center"><StatInput value={s.int} onSave={(val) => handleUpdateStat(s.id, 'int', val)} className="w-16 border border-slate-200 rounded p-1 text-center bg-blue-50 focus:bg-white outline-none focus:border-blue-400 font-bold text-slate-900" /></td>
                                <td className="p-3 text-center"><StatInput value={s.coins} onSave={(val) => handleUpdateStat(s.id, 'coins', val)} className="w-16 border border-slate-200 rounded p-1 text-center bg-emerald-50 focus:bg-white outline-none focus:border-emerald-400 font-bold text-slate-900" /></td>
                                <td className="p-3 text-center flex justify-center gap-2">
                                  <button onClick={() => setEditingStudent({...s, isInventoryEdit: false})} className="text-blue-500 hover:text-blue-600 transition p-1 bg-blue-50 rounded cursor-pointer" title="상세수정"><Edit2 size={16}/></button>
                                  <button onClick={() => handleDeleteStudent(s.id)} className="text-red-400 hover:text-red-500 transition p-1 bg-red-50 rounded cursor-pointer" title="삭제"><Trash2 size={16}/></button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                      <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">📥 학생 명단 일괄 업로드</h2></div>
                      <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">첫 줄에 <span className="font-bold text-blue-600">학번, 이름, 비밀번호</span> 헤더가 있는 CSV 엑셀 파일을 업로드하세요.</p>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-slate-100 transition group">
                          <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" onClick={(e) => e.target.value = null} />
                          <div className="text-sm text-slate-600 font-bold group-hover:text-blue-600 flex flex-col items-center gap-2"><Upload size={24} className="text-slate-400 group-hover:text-blue-500"/>CSV 파일 선택하기</div>
                        </label>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">➕ 개별 학생 추가</h2>
                      <form onSubmit={handleAddStudent} className="flex flex-col gap-3">
                        <div className="flex gap-2">
                          <div className="flex-1"><label className="block text-xs font-bold text-slate-500 mb-1">학번 입력</label><input type="text" name="studentNumber" required placeholder="예: 10101" className="w-full text-slate-900 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition" /></div>
                          <div className="flex-1"><label className="block text-xs font-bold text-slate-500 mb-1">이름 입력</label><input type="text" name="studentName" required placeholder="예: 김자람" className="w-full text-slate-900 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition" /></div>
                        </div>
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">초기 비밀번호 지정</label><input type="text" name="password" required placeholder="예: 1234" className="w-full text-slate-900 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition" /></div>
                        <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-lg transition shadow-md mt-1 cursor-pointer">학생 추가하기</button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'questManagement' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-200">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-700">📜 정령의 의뢰소 (퀘스트 관리)</h2>
                    <form onSubmit={handleAddQuest} className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-end mb-6 shadow-inner">
                      <div className="flex-1 w-full"><label className="block text-xs font-bold text-emerald-700 mb-1">의뢰명 (퀘스트 이름)</label><input type="text" name="title" required placeholder="예: 아침 30분 걷기" className="w-full text-slate-900 border border-emerald-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 bg-white" /></div>
                      <div className="w-full md:w-auto">
                        <label className="block text-xs font-bold text-emerald-700 mb-1">보상 종류</label>
                        <select name="stat" required className="w-full text-slate-900 border border-emerald-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 bg-white font-medium">
                          <option value="STR">체력 (STR)</option><option value="CHA">친화력 (CHA)</option><option value="INT">정신력 (INT)</option><option value="COINS">씨앗 (코인)</option>
                        </select>
                      </div>
                      <div className="w-full md:w-32"><label className="block text-xs font-bold text-emerald-700 mb-1">보상 수치</label><input type="number" name="reward" required placeholder="예: 5" className="w-full text-slate-900 border border-emerald-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 bg-white" /></div>
                      <button type="submit" className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold whitespace-nowrap shadow-md transition cursor-pointer">퀘스트 등록</button>
                    </form>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {quests.map(q => (
                        <div key={q.id} className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between shadow-sm hover:border-emerald-300 transition group">
                          <div>
                            <span className={`text-xs font-bold px-2 py-1 rounded w-fit mb-2 inline-block ${q.stat === 'STR' ? 'bg-red-100 text-red-600' : q.stat === 'CHA' ? 'bg-amber-100 text-amber-600' : q.stat === 'INT' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>보상: {q.stat} +{q.reward}</span>
                            <p className="font-bold text-slate-800 leading-tight">{q.title}</p>
                          </div>
                          <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => setEditingQuest(q)} className="text-xs font-bold text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1"><Edit2 size={12}/> 수정</button>
                            <button onClick={() => handleDeleteQuest(q.id)} className="text-xs font-bold text-red-400 hover:text-red-500 cursor-pointer flex items-center gap-1"><Trash2 size={12}/> 삭제</button>
                          </div>
                        </div>
                      ))}
                      {quests.length === 0 && <div className="col-span-full p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">등록된 퀘스트가 없습니다.</div>}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-700">💎 비밀 상점 (커스텀 보상 관리)</h2>
                    <form onSubmit={handleAddShopItem} className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-end mb-6 shadow-inner">
                      <div className="flex-1 w-full"><label className="block text-xs font-bold text-amber-700 mb-1">상품명</label><input type="text" name="name" required placeholder="예: 자리바꾸기권" className="w-full text-slate-900 border border-amber-200 rounded-lg p-2.5 text-sm outline-none focus:border-amber-500 bg-white" /></div>
                      <div className="w-full md:w-32"><label className="block text-xs font-bold text-amber-700 mb-1">가격(씨앗)</label><input type="number" name="price" required placeholder="예: 50" className="w-full text-slate-900 border border-amber-200 rounded-lg p-2.5 text-sm outline-none focus:border-amber-500 bg-white" /></div>
                      <div className="w-full md:w-32"><label className="block text-xs font-bold text-amber-700 mb-1">재고 현황</label><input type="number" name="stock" required placeholder="예: 10" className="w-full text-slate-900 border border-amber-200 rounded-lg p-2.5 text-sm outline-none focus:border-amber-500 bg-white" /></div>
                      <button type="submit" className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg font-bold whitespace-nowrap shadow-md transition cursor-pointer">상품 등록</button>
                    </form>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {shopItems.map(item => (
                        <div key={item.id} className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between shadow-sm hover:border-amber-300 transition group">
                          <div>
                            <div className="flex justify-between items-start mb-2"><span className="font-bold text-slate-800">{item.name}</span><span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-xs">🌱 {item.price}</span></div>
                            <p className="text-sm font-bold text-amber-600">남은 수량: {item.stock || 0}개</p>
                          </div>
                          <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => setEditingShopItem(item)} className="text-xs font-bold text-blue-500 hover:text-blue-600 cursor-pointer flex items-center gap-1"><Edit2 size={12}/> 수정</button>
                            <button onClick={() => handleDeleteShopItem(item.id)} className="text-xs font-bold text-red-400 hover:text-red-500 cursor-pointer flex items-center gap-1"><Trash2 size={12}/> 삭제</button>
                          </div>
                        </div>
                      ))}
                      {shopItems.length === 0 && <div className="col-span-full p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">등록된 상품이 없습니다.</div>}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-200">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-700"><Package size={20}/> 학생 인벤토리 관리</h2>
                    <p className="text-sm text-slate-600 mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100">학생들이 구매하여 보유 중인 상점 아이템 현황을 확인하고 강제로 수량을 조정할 수 있습니다.</p>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[400px] overflow-y-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="sticky top-0 bg-slate-50 z-20 shadow-sm">
                          <tr className="text-slate-600 border-b border-slate-200 text-sm">
                            <th className="p-3 font-semibold text-center w-20">학번</th><th className="p-3 font-semibold w-24">이름</th><th className="p-3 font-semibold">보유 아이템 현황 (수량)</th><th className="p-3 font-semibold text-center w-24">관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map(s => {
                            const hasItems = s.inventory && Object.values(s.inventory).some(i => i.quantity > 0);
                            return (
                              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="p-3 text-center text-sm font-medium">{s.studentNumber}</td><td className="p-3 font-bold text-slate-800">{s.name}</td>
                                <td className="p-3">
                                  <div className="flex flex-wrap gap-2">
                                    {!hasItems && <span className="text-xs text-slate-400">가진 아이템이 없습니다.</span>}
                                    {hasItems && Object.entries(s.inventory).map(([itemId, item]) => {
                                      if (item.quantity <= 0) return null;
                                      return (<span key={itemId} className="bg-purple-100 text-purple-700 border border-purple-200 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">{item.name} <span className="bg-white px-1.5 rounded text-purple-800">{item.quantity}개</span></span>);
                                    })}
                                  </div>
                                </td>
                                <td className="p-3 text-center"><button onClick={() => setEditingStudent({...s, isInventoryEdit: true})} className="text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition font-bold text-xs cursor-pointer">수량 조정</button></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {showBatchModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fadeIn overflow-y-auto pointer-events-auto">
              <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative m-auto">
                <button onClick={() => setShowBatchModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full p-1 transition z-50 cursor-pointer"><X size={20}/></button>
                <h3 className="text-xl font-bold mb-6 text-blue-600 flex items-center gap-2"><CheckSquare size={20}/> 선택 학생 스탯/씨앗 일괄 부여</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const addStr = Number(e.target.str.value) || 0; const addCha = Number(e.target.cha.value) || 0; const addInt = Number(e.target.int.value) || 0; const addCoins = Number(e.target.coins.value) || 0;
                  if (addStr === 0 && addCha === 0 && addInt === 0 && addCoins === 0) return customAlert('알림', '부여할 값을 하나 이상 입력해주세요.');
                  const batch = writeBatch(db);
                  selectedStudents.forEach(id => {
                     const s = students.find(x => x.id === id);
                     if (s) { batch.update(doc(db, "students", id), { str: (s.str || 0) + addStr, cha: (s.cha || 0) + addCha, int: (s.int || 0) + addInt, coins: (s.coins || 0) + addCoins }); }
                  });
                  await batch.commit(); setShowBatchModal(false); setSelectedStudents([]);
                  customAlert('일괄 부여 완료', `${selectedStudents.length}명의 학생에게 일괄 적용되었습니다.`);
                }} className="space-y-4 relative z-10">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div><label className="block text-xs font-bold text-red-600 mb-1">체력 (STR) 증감</label><input type="number" name="str" placeholder="예: 5 또는 -2" className="w-full border border-red-200 rounded-lg p-2.5 text-sm outline-none focus:border-red-400 font-bold text-slate-900" /></div>
                    <div><label className="block text-xs font-bold text-amber-600 mb-1">친화력 (CHA) 증감</label><input type="number" name="cha" placeholder="예: 5 또는 -2" className="w-full border border-amber-200 rounded-lg p-2.5 text-sm outline-none focus:border-amber-400 font-bold text-slate-900" /></div>
                    <div><label className="block text-xs font-bold text-blue-600 mb-1">정신력 (INT) 증감</label><input type="number" name="int" placeholder="예: 5 또는 -2" className="w-full border border-blue-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-400 font-bold text-slate-900" /></div>
                    <div><label className="block text-xs font-bold text-emerald-700 mb-1">씨앗 (코인) 증감</label><input type="number" name="coins" placeholder="예: 5 또는 -2" className="w-full border border-emerald-300 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 font-bold text-slate-900" /></div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg mt-2 cursor-pointer">일괄 적용하기</button>
                </form>
              </div>
            </div>
          )}

          {editingStudent && (
            <div key={editingStudent.id} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fadeIn overflow-y-auto pointer-events-auto">
              <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative m-auto pointer-events-auto">
                <button onClick={() => setEditingStudent(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full p-1 transition z-50 cursor-pointer"><X size={20}/></button>
                {!editingStudent.isInventoryEdit ? (
                  <>
                    <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2"><Edit2 size={20} className="text-blue-500"/> 개별 학생 상세 수정</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const num = e.target.num.value; const name = e.target.name.value;
                      const dup = students.find(s => s.id !== editingStudent.id && (String(s.studentNumber).trim() === String(num).trim() || String(s.name).trim() === String(name).trim()));
                      if (dup) {
                         return customConfirm('⚠️ [중복 알림]', `이미 동일한 학번(${dup.studentNumber})이나 이름(${dup.name})이 존재합니다.\n그래도 수정사항을 강제로 저장하시겠습니까?`, async () => {
                           await updateDoc(doc(db, "students", editingStudent.id), { studentNumber: num, name: name, password: e.target.pwd.value, str: Number(e.target.str.value), cha: Number(e.target.cha.value), int: Number(e.target.int.value), coins: Number(e.target.coins.value) });
                           setEditingStudent(null); customAlert('수정 완료', '학생 정보가 수정되었습니다.');
                         });
                      }
                      await updateDoc(doc(db, "students", editingStudent.id), { studentNumber: num, name: name, password: e.target.pwd.value, str: Number(e.target.str.value), cha: Number(e.target.cha.value), int: Number(e.target.int.value), coins: Number(e.target.coins.value) });
                      setEditingStudent(null); customAlert('수정 완료', '학생 정보가 안전하게 수정되었습니다.');
                    }} className="space-y-4 relative z-10">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4">
                        <div className="col-span-1"><label className="block text-xs font-bold text-slate-500 mb-1">학번</label><input type="text" name="num" defaultValue={editingStudent.studentNumber} required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 text-slate-800 font-bold" /></div>
                        <div className="col-span-1"><label className="block text-xs font-bold text-slate-500 mb-1">이름</label><input type="text" name="name" defaultValue={editingStudent.name} required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 text-slate-800 font-bold" /></div>
                        <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 mb-1">비밀번호</label><input type="text" name="pwd" defaultValue={editingStudent.password} required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 text-slate-800 font-bold" /></div>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-red-600 mb-1">체력 (STR)</label><input type="number" name="str" defaultValue={editingStudent.str} required className="w-full border border-red-200 rounded-lg p-2.5 text-sm outline-none focus:border-red-400 font-bold text-slate-800" /></div>
                        <div><label className="block text-xs font-bold text-amber-600 mb-1">친화력 (CHA)</label><input type="number" name="cha" defaultValue={editingStudent.cha} required className="w-full border border-amber-200 rounded-lg p-2.5 text-sm outline-none focus:border-amber-400 font-bold text-slate-800" /></div>
                        <div><label className="block text-xs font-bold text-blue-600 mb-1">정신력 (INT)</label><input type="number" name="int" defaultValue={editingStudent.int} required className="w-full border border-blue-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-400 font-bold text-slate-800" /></div>
                        <div><label className="block text-xs font-bold text-emerald-700 mb-1">씨앗 (코인)</label><input type="number" name="coins" defaultValue={editingStudent.coins} required className="w-full border border-emerald-300 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 font-bold text-slate-800" /></div>
                      </div>
                      <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition shadow-md mt-4 cursor-pointer">수정 내용 저장</button>
                    </form>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold mb-6 text-purple-700 flex items-center gap-2"><Package size={20}/> {editingStudent.name} 학생 인벤토리 관리</h3>
                    <div className="space-y-4">
                      {shopItems.length === 0 && <p className="text-slate-500 text-sm text-center bg-slate-50 p-4 rounded-xl">상점에 등록된 아이템이 아직 없습니다.</p>}
                      {shopItems.map(item => {
                        const currentQty = editingStudent.inventory?.[item.id]?.quantity || 0;
                        return (
                          <div key={item.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <span className="font-bold text-slate-800">{item.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">보유: {currentQty}개</span>
                              <div className="flex gap-1">
                                <button type="button" onClick={() => { handleInventoryAdjust(editingStudent.id, item.id, item.name, currentQty, 1); setEditingStudent({...editingStudent, inventory: {...editingStudent.inventory, [item.id]: {name: item.name, quantity: currentQty + 1}}}) }} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded cursor-pointer font-bold text-sm transition">+</button>
                                <button type="button" onClick={() => { handleInventoryAdjust(editingStudent.id, item.id, item.name, currentQty, -1); setEditingStudent({...editingStudent, inventory: {...editingStudent.inventory, [item.id]: {name: item.name, quantity: Math.max(0, currentQty - 1)}}}) }} disabled={currentQty === 0} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded cursor-pointer font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed">-</button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {editingQuest && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fadeIn overflow-y-auto pointer-events-auto">
              <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative m-auto pointer-events-auto">
                <button onClick={() => setEditingQuest(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full p-1 transition z-50 cursor-pointer"><X size={20}/></button>
                <h3 className="text-xl font-bold mb-6 text-emerald-700 flex items-center gap-2"><Edit2 size={20}/> 퀘스트 내용 수정</h3>
                <form onSubmit={handleUpdateQuest} className="space-y-4">
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">의뢰명</label><input type="text" name="title" defaultValue={editingQuest.title} required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 text-slate-800 font-bold" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">보상 종류</label>
                      <select name="stat" defaultValue={editingQuest.stat} required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 text-slate-800 font-bold"><option value="STR">체력 (STR)</option><option value="CHA">친화력 (CHA)</option><option value="INT">정신력 (INT)</option><option value="COINS">씨앗 (코인)</option></select>
                    </div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">보상 수치</label><input type="number" name="reward" defaultValue={editingQuest.reward} required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 text-slate-800 font-bold" /></div>
                  </div>
                  <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition mt-4 cursor-pointer">수정 완료</button>
                </form>
              </div>
            </div>
          )}

          {editingShopItem && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fadeIn overflow-y-auto pointer-events-auto">
              <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative m-auto pointer-events-auto">
                <button onClick={() => setEditingShopItem(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full p-1 transition z-50 cursor-pointer"><X size={20}/></button>
                <h3 className="text-xl font-bold mb-6 text-amber-700 flex items-center gap-2"><Edit2 size={20}/> 상점 아이템 수정</h3>
                <form onSubmit={handleUpdateShopItem} className="space-y-4">
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">상품명</label><input type="text" name="name" defaultValue={editingShopItem.name} required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-amber-500 text-slate-800 font-bold" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">가격(씨앗)</label><input type="number" name="price" defaultValue={editingShopItem.price} required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-amber-500 text-slate-800 font-bold" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1">재고 수량</label><input type="number" name="stock" defaultValue={editingShopItem.stock || 0} required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-amber-500 text-slate-800 font-bold" /></div>
                  </div>
                  <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition mt-4 cursor-pointer">수정 완료</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- 5. 학생 대시보드 --- */}
      {view === 'student' && userData && (() => {
        const currentLevel = calculateLevel(userData.str, userData.cha, userData.int);
        const currentRole = calculateRole(userData.str, userData.cha, userData.int);
        const currentAsset = HERO_ASSETS[currentRole] || HERO_ASSETS['꼬마 새싹']; 
        const maxStat = Math.max(150, Number(userData.str) || 0, Number(userData.cha) || 0, Number(userData.int) || 0);
        
        const chartData = [
          { subject: '체력 (STR)', A: Number(userData.str) || 0, fullMark: maxStat },
          { subject: '친화력 (CHA)', A: Number(userData.cha) || 0, fullMark: maxStat },
          { subject: '정신력 (INT)', A: Number(userData.int) || 0, fullMark: maxStat },
        ];

        return (
          <div className="min-h-screen w-full font-sans text-white flex flex-col bg-slate-900 bg-cover bg-center bg-fixed p-4 md:p-8 pointer-events-auto" style={{ backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.70), rgba(15, 23, 42, 0.70)), url('/images/bg_forest.jpg')" }}>
            <div className="w-full max-w-5xl mx-auto flex flex-col flex-grow space-y-6">
              
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl px-4 md:px-6 h-16 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 md:gap-3"><Shield className="text-emerald-500" size={24} /><span className="font-bold text-base md:text-lg text-white">숲속 포털</span></div>
                <div className="flex items-center gap-2 md:gap-3">
                  <button type="button" onClick={toggleMusic} className={`flex items-center gap-1 hover:bg-slate-700 font-bold py-1.5 px-2.5 md:px-3 rounded-xl shadow-md transition text-xs border border-slate-600 cursor-pointer ${isMusicPlaying ? 'bg-emerald-600/30 text-emerald-400' : 'bg-slate-800 text-slate-400'}`} title="배경음악 재생/정지">{isMusicPlaying ? <Music size={14} className="animate-pulse" /> : <VolumeX size={14} />} <span className="hidden md:inline">BGM</span></button>
                  <button type="button" onClick={() => setShowPwdModal(true)} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 px-2.5 md:px-3 rounded-xl shadow-md transition text-xs border border-slate-600 cursor-pointer" title="비밀번호 변경"><Lock size={14} /> <span className="hidden md:inline">비번변경</span></button>
                  <button type="button" onClick={() => setShowGuideModal(true)} className="hidden md:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-1.5 px-3 rounded-xl shadow-md transition text-xs border border-slate-600 cursor-pointer"><BookOpen size={14} /> 진화 가이드</button>
                  <div className="bg-slate-800 px-2.5 md:px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 md:gap-2 shadow-inner"><span className="text-sm md:text-base">🌱</span><span className="font-black text-emerald-400 text-sm md:text-base">{userData.coins}</span></div>
                  <button type="button" onClick={handleLogout} className="text-slate-400 hover:text-white transition p-1.5 md:p-2 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700 cursor-pointer"><LogOut size={18}/></button>
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800/80 aspect-[4/3] md:aspect-[21/9] bg-black relative flex flex-col items-center justify-center p-4 md:p-6">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105" style={{ backgroundImage: `url(${currentAsset.backgroundImage})` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-90"></div> 
                <div className="relative z-10 flex flex-col items-center">
                  <img src={currentAsset.characterImage} alt={currentRole} className={`h-48 md:h-64 object-contain mb-2 drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] ${getRoleAnimation(currentRole)}`} onError={(e) => { e.target.src = "/images/jaram_stage1_baby.png"; }} />
                  <div className="text-center">
                    <div className="flex justify-center gap-2 mb-2"><span className="bg-emerald-500/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg border border-emerald-400/50">Level {currentLevel}</span><span className="bg-slate-800/80 backdrop-blur text-emerald-300 px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-slate-600">{currentRole}</span></div>
                    <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight">{userData.name}</h2>
                  </div>
                </div>
              </div>

              <div className="flex bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/50 shadow-lg overflow-x-auto whitespace-nowrap scrollbar-hide">
                {['home', 'quest', 'shop', 'inventory'].map((tabName, idx) => {
                  const labels = ['내 정보', '퀘스트 보드', '비밀 상점', '나의 보관함'];
                  const icons = [<Star size={16} className="shrink-0"/>, <ScrollText size={16} className="shrink-0"/>, <Shield size={16} className="shrink-0"/>, <Package size={16} className="shrink-0"/>];
                  return (
                    <button key={tabName} type="button" onClick={() => setStudentTab(tabName)} className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 md:gap-2 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm transition cursor-pointer px-2 ${studentTab === tabName ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
                      {icons[idx]} {labels[idx]}
                    </button>
                  )
                })}
              </div>

              <div className="animate-fadeIn">
                {studentTab === 'home' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 flex flex-col shadow-xl">
                      <h3 className="text-lg font-bold text-slate-300 mb-6 border-b border-slate-700 pb-4">스탯 밸런스 레이더</h3>
                      <div className="w-full flex-grow flex items-center justify-center min-h-[350px]">
                        <ResponsiveContainer width="100%" height={350}>
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, maxStat]} tick={{ fill: '#64748b', fontSize: 11 }} tickCount={4} />
                            <Radar name="능력치" dataKey="A" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} label={{ fill: '#34d399', fontSize: 14, fontWeight: 'bold', position: 'top' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#10b981', fontWeight: 'bold' }}/>
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 flex flex-col shadow-xl">
                      <h3 className="text-lg font-bold text-slate-300 mb-6 border-b border-slate-700 pb-4">상세 능력치</h3>
                      <div className="space-y-8 flex-grow flex flex-col justify-center">
                        <div>
                          <div className="flex justify-between text-sm mb-3"><span className="text-red-400 font-bold flex items-center gap-1"><Shield size={16}/> 체력 (STR)</span><span className="font-black text-slate-200 text-lg">{userData.str}</span></div>
                          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5"><div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-1000 relative" style={{ width: `${(userData.str / maxStat) * 100}%` }}></div></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-3"><span className="text-amber-400 font-bold flex items-center gap-1"><Heart size={16}/> 친화력 (CHA)</span><span className="font-black text-slate-200 text-lg">{userData.cha}</span></div>
                          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5"><div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-1000 relative" style={{ width: `${(userData.cha / maxStat) * 100}%` }}></div></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-3"><span className="text-blue-400 font-bold flex items-center gap-1"><Brain size={16}/> 정신력 (INT)</span><span className="font-black text-slate-200 text-lg">{userData.int}</span></div>
                          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5"><div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 relative" style={{ width: `${(userData.int / maxStat) * 100}%` }}></div></div>
                        </div>
                      </div>
                      <div className="mt-8 p-4 bg-slate-800/80 rounded-xl border border-slate-700/50 text-sm text-slate-300 leading-relaxed text-center font-medium shadow-inner">"{currentAsset.description}"</div>
                    </div>
                  </div>
                )}

                {studentTab === 'quest' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quests.map(q => (
                      <div key={q.id} className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition flex flex-col justify-between min-h-[140px] shadow-lg">
                        <div>
                          <span className={`text-[10px] font-black px-2 py-1 rounded w-fit mb-3 inline-block uppercase tracking-wider ${q.stat === 'STR' ? 'bg-red-500/20 text-red-400' : q.stat === 'CHA' ? 'bg-amber-500/20 text-amber-400' : q.stat === 'INT' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{q.stat} +{q.reward}</span>
                          <h4 className="font-bold text-lg text-slate-100 leading-snug">{q.title}</h4>
                        </div>
                        <button type="button" onClick={() => { setSelectedQuest(q); setShowQuestSubmit(true); }} className="mt-4 bg-slate-700 hover:bg-emerald-600 text-white font-bold text-sm py-2.5 rounded-xl transition shadow-lg w-full cursor-pointer">의뢰 수행하기</button>
                      </div>
                    ))}
                    {quests.length === 0 && <div className="col-span-full p-10 text-center text-slate-400 bg-slate-900/80 rounded-2xl">현재 등록된 퀘스트가 없습니다.</div>}
                  </div>
                )}

                {studentTab === 'shop' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shopItems.map(item => {
                      const isOutOfStock = Number(item.stock) <= 0;
                      const hasEnoughCoins = Number(userData.coins) >= Number(item.price);
                      return (
                        <div key={item.id} className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition flex flex-col justify-between min-h-[120px] shadow-lg">
                          <div>
                            <div className="flex justify-between items-start mb-3"><h4 className="font-bold text-lg text-slate-100 leading-snug">{item.name}</h4><span className="bg-emerald-500/20 text-emerald-400 font-black px-2 py-1 rounded-lg text-xs border border-emerald-500/20">🌱 {item.price}</span></div>
                            <p className={`text-sm font-bold ${isOutOfStock ? 'text-red-400' : 'text-amber-400'}`}>남은 수량: {item.stock || 0}개</p>
                          </div>
                          <button type="button" onClick={() => handleBuyItem(item)} disabled={isOutOfStock} className={`mt-4 font-bold text-sm py-2.5 rounded-xl transition shadow-lg w-full cursor-pointer ${!isOutOfStock && hasEnoughCoins ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-700 text-slate-500 opacity-50 cursor-not-allowed'}`}>
                            {isOutOfStock ? '품절' : '구매하기'}
                          </button>
                        </div>
                      )
                    })}
                    {shopItems.length === 0 && <div className="col-span-full p-10 text-center text-slate-400 bg-slate-900/80 rounded-2xl">상점이 아직 준비 중입니다.</div>}
                  </div>
                )}

                {studentTab === 'inventory' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(userData.inventory || {}).filter(([_, item]) => item.quantity > 0).map(([itemId, itemInfo]) => (
                      <div key={itemId} className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-purple-500/30 hover:border-purple-500/70 transition flex flex-col justify-between min-h-[120px] shadow-lg">
                        <div>
                          <div className="flex justify-between items-start mb-3"><h4 className="font-bold text-lg text-slate-100 leading-snug">{itemInfo.name}</h4><span className="bg-purple-500/20 text-purple-400 font-black px-2 py-1 rounded-lg text-xs border border-purple-500/20">보유: {itemInfo.quantity}개</span></div>
                        </div>
                        <button type="button" onClick={() => handleUseItemRequest(itemId, itemInfo)} className="mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm py-2.5 rounded-xl transition shadow-lg w-full cursor-pointer">사용 요청하기</button>
                      </div>
                    ))}
                    {Object.entries(userData.inventory || {}).filter(([_, item]) => item.quantity > 0).length === 0 && (
                      <div className="col-span-full p-10 text-center text-slate-400 bg-slate-900/80 rounded-2xl border border-slate-700/50"><Package size={32} className="mx-auto text-slate-500 mb-3" />보관함이 비어있습니다. 비밀 상점에서 아이템을 구해 보세요!</div>
                    )}
                  </div>
                )}
              </div>

              {/* 학생용 모달들 */}
              {isLevelUpPending && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999999] animate-fadeIn pointer-events-auto">
                  <div className="bg-slate-800 rounded-3xl p-6 md:p-8 relative max-w-sm w-full shadow-[0_0_50px_rgba(250,204,21,0.3)] border-4 border-yellow-400 m-auto">
                    <h2 className="text-2xl font-black mb-2 text-white flex items-center justify-center gap-2"><Star className="text-yellow-400" size={28}/> 레벨 업 축하합니다!</h2>
                    <p className="text-sm text-slate-300 mb-6 text-center leading-relaxed">Lv.{levelUpData.newLevel} 달성!<br/>성장의 정수 <strong className="text-yellow-400">{levelUpData.totalPoints}개</strong>를 획득했습니다.<br/>원하는 스탯에 전략적으로 투자하세요!</p>
                    <div className="bg-slate-900 rounded-2xl p-4 mb-6 space-y-4 shadow-inner">
                      <div className="flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700"><span className="font-bold text-yellow-400 text-sm">남은 정수: {statPointsToDistribute.pointsLeft}개</span></div>
                      <div className="space-y-3">
                        {['str', 'cha', 'int'].map(stat => {
                          const labels = { str: '체력', cha: '친화력', int: '정신력' };
                          const colors = { str: 'text-red-400', cha: 'text-amber-400', int: 'text-blue-400' };
                          const icons = { str: <Shield size={16}/>, cha: <Heart size={16}/>, int: <Brain size={16}/> };
                          return (
                            <div key={stat} className="flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700">
                              <span className={`font-bold text-sm flex items-center gap-2 ${colors[stat]}`}>{icons[stat]} {labels[stat]}</span>
                              <div className="flex items-center gap-3">
                                <button onClick={() => adjustStatPoint(stat, -1)} disabled={statPointsToDistribute[stat] === 0} className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">-</button>
                                <span className="font-black text-white w-4 text-center">+{statPointsToDistribute[stat]}</span>
                                <button onClick={() => adjustStatPoint(stat, 1)} disabled={statPointsToDistribute.pointsLeft === 0} className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">+</button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <button onClick={handleStatAllocation} disabled={statPointsToDistribute.pointsLeft > 0} className="w-full font-bold py-3.5 rounded-xl transition shadow-lg cursor-pointer disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed bg-yellow-500 hover:bg-yellow-400 text-yellow-950">
                      {statPointsToDistribute.pointsLeft > 0 ? '정수를 모두 분배해 주세요' : '성장의 정수 흡수하기'}
                    </button>
                  </div>
                </div>
              )}

              {showQuestSubmit && selectedQuest && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999] animate-fadeIn overflow-y-auto pointer-events-auto">
                  <div className="bg-slate-800 rounded-3xl p-6 md:p-8 relative max-w-md w-full shadow-2xl border border-slate-600 m-auto">
                    <button type="button" onClick={() => {setShowQuestSubmit(false); setSelectedQuest(null); setQuestImageBase64('');}} className="absolute top-6 right-6 text-slate-400 hover:text-white transition bg-slate-700 p-1 rounded-full cursor-pointer z-50"><X size={20} /></button>
                    <h2 className="text-xl font-bold mb-1 text-white">의뢰 수행 보고</h2>
                    <p className="text-sm text-slate-400 mb-6 font-sans">[{selectedQuest.title}] 완료를 선생님께 알립니다.</p>
                    <form onSubmit={handleQuestSubmit} className="space-y-4 relative z-10">
                      <div><label className="block text-sm font-bold text-slate-300 mb-2">수행 소감 (글 작성)</label><textarea name="text" rows="3" placeholder="내용을 적어주세요." className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition resize-none font-sans" required></textarea></div>
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">인증 사진 첨부 (선택)</label>
                        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setQuestImageBase64)} className="w-full bg-slate-900 text-slate-400 border border-slate-700 rounded-xl px-4 py-2 outline-none focus:border-emerald-500 transition font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 cursor-pointer" />
                        {questImageBase64 && <div className="mt-3 relative inline-block"><img src={questImageBase64} alt="미리보기" className="h-32 object-contain rounded-lg border border-slate-600 shadow-md" /><button type="button" onClick={() => setQuestImageBase64('')} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white rounded-full p-1 cursor-pointer transition shadow-lg"><X size={14}/></button></div>}
                      </div>
                      <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition mt-4 shadow-lg cursor-pointer">선생님께 보고하기</button>
                    </form>
                  </div>
                </div>
              )}

              {showPwdModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999] animate-fadeIn pointer-events-auto">
                  <div className="bg-slate-800 rounded-3xl p-6 md:p-8 relative max-w-sm w-full shadow-2xl border border-slate-600 m-auto">
                    <button type="button" onClick={() => setShowPwdModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition bg-slate-700 p-1 rounded-full cursor-pointer z-50"><X size={20} /></button>
                    <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><Lock size={20}/> 비밀번호 재설정</h2>
                    <form onSubmit={handleChangePassword} className="space-y-4 relative z-10">
                      <div><label className="block text-sm font-bold text-slate-300 mb-2">현재 비밀번호</label><input type="password" name="currentPwd" required placeholder="기존 비밀번호" className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition" /></div>
                      <div><label className="block text-sm font-bold text-slate-300 mb-2">새 비밀번호</label><input type="password" name="newPwd" required placeholder="변경할 비밀번호" className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition" /></div>
                      <div><label className="block text-sm font-bold text-slate-300 mb-2">새 비밀번호 확인</label><input type="password" name="confirmPwd" required placeholder="한 번 더 입력해 주세요" className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition" /></div>
                      <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition mt-6 shadow-lg cursor-pointer">비밀번호 변경하기</button>
                    </form>
                  </div>
                </div>
              )}

              {showDailyGift && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[999999] animate-fadeIn pointer-events-auto">
                  <div className="bg-slate-800 rounded-3xl p-6 md:p-10 relative max-w-3xl w-full shadow-2xl border-4 border-emerald-500 m-auto text-center">
                    {!openedGift ? (
                      <>
                        <h2 className="text-3xl md:text-4xl font-black mb-4 text-white flex items-center justify-center gap-3"><Gift className="text-emerald-400" size={40}/> 오늘의 출석 보상!</h2>
                        <p className="text-slate-300 mb-8 font-bold text-sm md:text-base bg-slate-900/50 inline-block px-6 py-3 rounded-full border border-slate-700">5개의 상자 중 하나를 선택하세요. <span className="text-red-400">(1개의 꽝이 숨어있습니다!)</span></p>
                        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                          {dailyGifts.map((gift, idx) => {
                            const isSelected = selectedGiftIndex === idx;
                            return (
                              <button key={idx} onClick={() => handleOpenGift(idx)} disabled={isGiftOpening} className={`w-24 h-24 md:w-32 md:h-32 bg-slate-700 border-2 rounded-3xl flex items-center justify-center transition-all shadow-[0_10px_20px_rgba(0,0,0,0.5)] ${isGiftOpening && !isSelected ? 'opacity-30 scale-95 pointer-events-none border-slate-800' : ''} ${isGiftOpening && isSelected ? 'border-emerald-400 bg-slate-600 scale-110 pointer-events-none' : 'hover:bg-slate-600 hover:border-emerald-400 cursor-pointer hover:-translate-y-3 border-slate-600'}`}>
                                <Gift size={48} className={`${isSelected ? 'text-emerald-400 animate-bounce' : 'text-emerald-600/70'}`} />
                              </button>
                            )
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="animate-fadeIn">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 text-white drop-shadow-lg">{openedGift.isDud ? '앗... 꽝입니다! 💦' : '축하합니다! 🎉'}</h2>
                        <div className="bg-slate-900/60 p-8 md:p-10 rounded-3xl border-2 border-slate-700 inline-block mb-10 shadow-inner">
                          {openedGift.isDud ? (<div className="text-6xl mb-4 animate-pulse">💨</div>) : (<>
                            <div className="text-6xl mb-4 text-emerald-400 font-black animate-bounce">+{openedGift.value}</div>
                            <div className="text-2xl font-bold text-slate-200">{openedGift.type === 'str' && '체력 (STR)'}{openedGift.type === 'cha' && '친화력 (CHA)'}{openedGift.type === 'int' && '정신력 (INT)'}{openedGift.type === 'coins' && '씨앗 (코인)'} 획득!</div>
                          </>)}
                        </div>
                        <div className="block"><button onClick={() => { setShowDailyGift(false); setOpenedGift(null); setIsGiftOpening(false); setSelectedGiftIndex(null); }} className="bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 px-12 rounded-2xl transition shadow-[0_5px_15px_rgba(16,185,129,0.4)] text-xl cursor-pointer hover:-translate-y-1">모험 시작하기</button></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </>
  );
}