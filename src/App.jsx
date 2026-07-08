import React, { useState, useEffect } from 'react';
import { Shield, Heart, Brain, Users, ScrollText, LogOut, Plus, Star, BookOpen, X, ArrowLeft, Upload, CheckCircle2, XCircle, Trash2, AlertTriangle, Edit2, CheckSquare } from 'lucide-react';
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
  writeBatch
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
  '꼬마 새싹': {
    characterImage: '/images/jaram_stage1_baby.png',
    backgroundImage: '/images/bg_forest.jpg',
    description: '건강한 습관을 막 시작한 귀여운 꼬마 새싹 자람이입니다.'
  },
  '수습 용사': {
    characterImage: '/images/jaram_stage2_apprentice.png', 
    backgroundImage: '/images/bg_forest.jpg',
    description: '작은 나무 검을 들고 모험을 시작한 용기 있는 수습 용사 자람이입니다.'
  },
  '전사': {
    characterImage: '/images/jaram_stage3_warrior.png',
    backgroundImage: '/images/bg_warrior_camp.jpg',
    description: '매일 꾸준히 체력을 단련하여 수호자가 된 늠름한 전사 자람이입니다.'
  },
  '성기사': {
    characterImage: '/images/jaram_stage3_paladin.png',
    backgroundImage: '/images/bg_paladin_temp.jpg', 
    description: '친구를 돕는 친절함으로 신비로운 꽃을 피워낸 성기사 자람이입니다.'
  },
  '마법사': {
    characterImage: '/images/jaram_stage3_mage.png',
    backgroundImage: '/images/bg_mage_library.jpg',
    description: '명상과 올바른 마음가짐으로 마력의 잎사귀를 얻은 지적인 마법사 자람이입니다.'
  },
  '마검사': {
    characterImage: '/images/jaram_stage3_spellsword.png', 
    backgroundImage: '/images/bg_magic_ruins.jpg',
    description: '강인한 육체와 정신력을 모두 단련하여 마법과 검을 동시에 부리는 마검사 자람이입니다.'
  },
  '정령술사': {
    characterImage: '/images/jaram_stage3_spiritbard.png',
    backgroundImage: '/images/bg_spirit_glade.jpg',
    description: '깊은 생각과 따뜻한 소통 능력을 갖추어 숲속 정령들의 연주자가 된 정령술사 자람이입니다.'
  },
  '수호대장': {
    characterImage: '/images/jaram_stage3_guardian.png',
    backgroundImage: '/images/bg_castle_courtyard.jpg',
    description: '튼튼한 몸과 훌륭한 협동성으로 동료들을 앞장서서 지켜주는 수호대장 자람이입니다.'
  },
  '초월 용사': {
    characterImage: '/images/jaram_stage4_transcendent.png', 
    backgroundImage: '/images/bg_celestial_garden.jpg',
    description: '모든 건강 스탯을 완벽하게 수련하여 생명의 비밀을 깨달은 궁극의 초월 용사 자람이입니다.'
  }
};

const calculateLevel = (str, cha, int) => Math.floor((str + cha + int) / 10) + 1;

const calculateRole = (str, cha, int) => {
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
  const [seenNotifTime, setSeenNotifTime] = useState(Date.now());

  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isConfirm: false });

  const customAlert = (title, message) => {
    setAlertModal({ isOpen: true, title, message, onConfirm: null, isConfirm: false });
  };

  const customConfirm = (title, message, onConfirm) => {
    setAlertModal({ isOpen: true, title, message, onConfirm, isConfirm: true });
  };

  const savedClassCode = localStorage.getItem('health_rpg_classCode') || '';

  useEffect(() => {
    const checkStudentSession = async () => {
       const studentId = localStorage.getItem('health_rpg_studentId');
       if (studentId) {
          try {
            const docRef = doc(db, "students", studentId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
               setUserRole('student');
               setUserData({ id: docSnap.id, ...docSnap.data() });
               setView('student');
               return true;
            }
          } catch(e) { console.error(e); }
       }
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
    if (view === 'student' && userData?.lastNotification) {
      if (userData.lastNotification.timestamp > seenNotifTime) {
        customAlert('🔔 선생님 알림 도착', userData.lastNotification.message);
        setSeenNotifTime(userData.lastNotification.timestamp);
      }
    }
  }, [userData?.lastNotification, view, seenNotifTime]);

  const handleImageChange = (e, setBase64) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800; 
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width;
        canvas.height = height;
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
        await setDoc(doc(db, "teachers", userCredential.user.uid), {
          email,
          name,
          classCode: newClassCode,
          createdAt: serverTimestamp()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setErrorMsg(`에러: ${error.message}`);
    }
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
      
      if (querySnapshot.empty) {
        setErrorMsg('학급 코드 또는 학번이 올바르지 않습니다.');
        return;
      }
      
      const studentDoc = querySnapshot.docs[0];
      const studentInfo = studentDoc.data();

      if (studentInfo.password !== password) {
         setErrorMsg('비밀번호가 일치하지 않습니다.');
         return;
      }

      localStorage.setItem('health_rpg_classCode', inputClassCode);
      localStorage.setItem('health_rpg_studentId', studentDoc.id);

      setUserRole('student');
      setUserData({ id: studentDoc.id, ...studentInfo });
      setView('student');
    } catch (error) {
       setErrorMsg(`에러: ${error.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('health_rpg_studentId');
    signOut(auth);
    setUserRole(null);
    setUserData(null);
    setView('landing');
  };

  const BackgroundWrapper = ({ children, center = true }) => (
    <div className="min-h-screen w-full relative font-sans text-slate-800 flex flex-col z-0">
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none z-[-20]"
        style={{ 
          backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.70), rgba(15, 23, 42, 0.70)), url('/images/bg_forest.jpg')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className={`relative z-10 w-full flex-grow flex flex-col ${center ? 'items-center justify-center p-4 md:p-8' : ''}`}>
         {children}
      </div>
    </div>
  );

  const GuideModal = () => (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fadeIn overflow-y-auto pointer-events-auto">
      <div className="bg-white rounded-3xl p-8 relative max-w-2xl w-full shadow-2xl border-4 border-slate-700 m-auto pointer-events-auto">
        <button onClick={() => setShowGuideModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition bg-slate-100 hover:bg-slate-200 rounded-full p-2 z-50 cursor-pointer pointer-events-auto">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-2 border-b-2 border-slate-100 pb-4">
          <BookOpen className="text-emerald-500"/> 진화 가이드북
        </h2>
        
        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 mb-6 shadow-inner">
          <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2"><Star size={16}/> 레벨업 공식</h3>
          <p className="text-slate-700 font-medium leading-relaxed">
            현재 레벨 = <span className="font-bold text-emerald-600 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-sm">(체력 + 친화력 + 정신력) ÷ 10 + 1</span><br/>
            <span className="text-sm text-slate-500 mt-2 block">💡 스탯 총합이 10점 오를 때마다 1레벨씩 성장합니다. (소수점 버림)</span>
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Shield size={16} className="text-blue-500"/> 단일 특화 직업 (Lv.30~)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="font-black text-red-600 text-base block mb-1">⚔️ 전사</span>
                <span className="text-slate-900 font-bold">체력(STR)이 가장 높을 때</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="font-black text-amber-600 text-base block mb-1">🤝 성기사</span>
                <span className="text-slate-900 font-bold">친화력(CHA)이 가장 높을 때</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="font-black text-blue-600 text-base block mb-1">🧠 마법사</span>
                <span className="text-slate-900 font-bold">정신력(INT)이 가장 높을 때</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Users size={16} className="text-purple-500"/> 하이브리드 직업 (Lv.30~ / 스탯 차이 5점 이내)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-gradient-to-br from-red-50 to-blue-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="font-black text-purple-700 text-base block mb-1">✨ 마검사</span>
                <span className="text-slate-900 font-bold">체력 + 정신력 융합</span>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-amber-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="font-black text-teal-700 text-base block mb-1">🎵 정령술사</span>
                <span className="text-slate-900 font-bold">정신력 + 친화력 융합</span>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-amber-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="font-black text-orange-700 text-base block mb-1">🛡️ 수호대장</span>
                <span className="text-slate-900 font-bold">체력 + 친화력 융합</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 rounded-2xl border border-slate-700 shadow-lg text-white">
            <span className="font-black text-yellow-400 text-lg flex items-center gap-2 mb-2">👑 초월 용사 (Lv.50 이상)</span>
            <p className="text-sm text-slate-200 leading-relaxed font-bold">
              3대 스탯(STR, CHA, INT)의 최댓값과 최솟값 차이가 5점 이내로 완벽한 밸런스를 이룰 때 자동 진화합니다. 천상의 정원 배경을 획득합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const AlertModalUI = () => {
    if (!alertModal.isOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-fadeIn pointer-events-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 m-auto text-left font-sans text-slate-800 pointer-events-auto">
          <h4 className="text-lg font-black mb-2 flex items-center gap-2">
            <Shield className="text-indigo-500" size={20} />
            {alertModal.title}
          </h4>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed whitespace-pre-line font-sans font-medium">
            {alertModal.message}
          </p>
          <div className="flex gap-2 justify-end">
            {alertModal.isConfirm && (
              <button type="button" onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-bold transition cursor-pointer pointer-events-auto">
                취소
              </button>
            )}
            <button type="button" onClick={() => { if (alertModal.onConfirm) { alertModal.onConfirm(); } setAlertModal(prev => ({ ...prev, isOpen: false })); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition shadow-md shadow-indigo-500/10 cursor-pointer pointer-events-auto">
              확인
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (view === 'landing') {
    return (
      <BackgroundWrapper>
        <div className="bg-[#2a2f4c]/90 p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-slate-700/50 backdrop-blur-md mx-auto relative z-10">
          <div className="flex justify-center mb-6">
            <Shield size={64} className="text-emerald-400 drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-md">건강지킴이 RPG</h1>
          <p className="text-emerald-200/80 mb-10 font-medium">Bloom Forest Adventure</p>
          
          <div className="space-y-4">
            <button onClick={() => setView('login_student')} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg py-4 px-4 rounded-xl transition shadow-lg shadow-emerald-500/20 cursor-pointer">
              학생 입장하기
            </button>
            <button onClick={() => setView('login_teacher')} className="w-full bg-[#3f466b] hover:bg-[#4b537c] text-white font-bold text-lg py-4 px-4 rounded-xl transition shadow-lg cursor-pointer">
              선생님 (관리자)
            </button>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  if (view === 'login_student' || view === 'login_teacher') {
    const isStudent = view === 'login_student';
    return (
      <BackgroundWrapper>
        <div className="w-full max-w-md mx-auto relative mt-16 z-10">
          <button onClick={() => {setView('landing'); setErrorMsg('');}} className="absolute -top-16 left-0 text-slate-300 hover:text-white flex items-center gap-2 transition bg-black/30 px-4 py-2 rounded-xl backdrop-blur-md cursor-pointer pointer-events-auto">
            <ArrowLeft size={20}/> 뒤로 가기
          </button>

          <div className={`bg-[#2a2f4c]/95 p-8 rounded-3xl shadow-2xl w-full border backdrop-blur-md ${isStudent ? 'border-emerald-500/30' : 'border-blue-500/30'}`}>
            <h2 className={`text-2xl font-bold mb-2 text-center flex flex-col items-center gap-2 ${isStudent ? 'text-emerald-400' : 'text-blue-400'}`}>
              {isStudent ? '숲속 포털 입장' : (isTeacherSignUp ? '선생님 회원가입' : '선생님 로그인')}
            </h2>
            {!isStudent && <p className="text-center text-slate-400 text-sm mb-6">학급 진화 게임을 개설하고 관리합니다.</p>}
            {isStudent && <p className="text-center text-slate-400 text-sm mb-6">선생님이 나눠주신 열쇠로 모험을 시작하세요.</p>}

            <form onSubmit={isStudent ? handleStudentLogin : handleTeacherAuth} className="space-y-4">
              {isStudent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-emerald-200/70 mb-1">학급 코드 (6자리)</label>
                    <input type="text" name="classCode" defaultValue={savedClassCode} required placeholder="예: UNFUPY" className="w-full bg-[#1c2136] text-white border border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 uppercase transition pointer-events-auto" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-emerald-200/70 mb-1">학번</label>
                    <input type="text" name="studentId" required placeholder="예: 10101" className="w-full bg-[#1c2136] text-white border border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition pointer-events-auto" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-emerald-200/70 mb-1">비밀번호</label>
                    <input type="password" name="password" required placeholder="비밀번호 입력" className="w-full bg-[#1c2136] text-white border border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition pointer-events-auto" />
                  </div>
                </>
              ) : (
                <>
                  {!isStudent && (
                    <div className="flex border-b border-slate-600 mb-6 rounded-lg overflow-hidden bg-[#1c2136] pointer-events-auto">
                      <button type="button" onClick={() => setIsTeacherSignUp(false)} className={`flex-1 py-2 text-sm font-bold transition cursor-pointer ${!isTeacherSignUp ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>로그인</button>
                      <button type="button" onClick={() => setIsTeacherSignUp(true)} className={`flex-1 py-2 text-sm font-bold transition cursor-pointer ${isTeacherSignUp ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>회원가입</button>
                    </div>
                  )}
                  {isTeacherSignUp && (
                    <div>
                      <label className="block text-sm font-medium text-blue-200/70 mb-1">선생님 닉네임</label>
                      <input type="text" name="name" required placeholder="예: 홍길동" className="w-full bg-[#1c2136] text-white border border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition pointer-events-auto" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-blue-200/70 mb-1">이메일 주소</label>
                    <input type="email" name="email" required placeholder="teacher@school.com" className="w-full bg-[#1c2136] text-white border border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition pointer-events-auto" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200/70 mb-1">비밀번호</label>
                    <input type="password" name="password" required placeholder="비밀번호 입력" className="w-full bg-[#1c2136] text-white border border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition pointer-events-auto" />
                  </div>
                </>
              )}
              
              {errorMsg && <div className="text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg flex items-center gap-2"><XCircle size={16}/> {errorMsg}</div>}

              <button type="submit" className={`w-full text-white font-bold py-3 px-4 rounded-xl transition mt-4 shadow-lg cursor-pointer pointer-events-auto ${isStudent ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'}`}>
                {isStudent ? '모험 시작!' : (isTeacherSignUp ? '신규 학급 개설하기' : '로그인')}
              </button>
            </form>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  if (view === 'teacher' && userData) {
    const checkDuplicate = (num, name, excludeId = null) => {
      return students.find(s => s.id !== excludeId && (String(s.studentNumber).trim() === String(num).trim() || String(s.name).trim() === String(name).trim()));
    };

    const handleUpdateStat = async (id, field, value) => {
      await updateDoc(doc(db, "students", id), {
        [field]: Number(value)
      });
    };

    const handleAddStudent = async (e) => {
      e.preventDefault();
      const num = e.target.studentNumber.value;
      const name = e.target.studentName.value;
      const pwd = e.target.password.value;
      
      const dup = checkDuplicate(num, name);
      if (dup) {
        customConfirm(
          `⚠️ [중복 알림]`,
          `이미 동일한 학번(${dup.studentNumber})이나 이름(${dup.name})이 존재합니다.\n그래도 추가하시겠습니까?`,
          async () => {
            await addDoc(collection(db, "students"), {
              classCode: userData.classCode,
              teacherId: userData.id,
              studentNumber: num,
              name: name,
              password: pwd,
              str: 0, cha: 0, int: 0, coins: 0,
              createdAt: serverTimestamp()
            });
            e.target.reset();
          }
        );
        return;
      }

      await addDoc(collection(db, "students"), {
        classCode: userData.classCode,
        teacherId: userData.id,
        studentNumber: num,
        name: name,
        password: pwd,
        str: 0, cha: 0, int: 0, coins: 0,
        createdAt: serverTimestamp()
      });
      e.target.reset();
    };

    // ✅ 스마트 인코딩 분석 기반 CSV 업로더 (EUC-KR / UTF-8 동시 완벽 지원)
    const handleCSVUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const buffer = event.target.result;
          
          // 1차 시도: UTF-8 디코딩
          let text = new TextDecoder('utf-8').decode(buffer);
          
          // 한글 깨짐 기호()가 있거나 핵심 단어가 안 보이면 2차 시도: EUC-KR 디코딩 (한글 윈도우 엑셀 기본값)
          if (text.includes('') || (!text.includes('학번') && !text.includes('이름'))) {
            text = new TextDecoder('euc-kr').decode(buffer);
          }

          const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
          
          if (lines.length <= 1) {
            customAlert('오류', '유효한 학생 데이터가 없습니다. CSV 양식을 확인해주세요.');
            e.target.value = '';
            return;
          }

          // 헤더 정제 (보이지 않는 특수문자, 띄어쓰기, 따옴표 완벽 제거)
          const headers = lines[0].split(',').map(h => h.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF"]+|"$/g, "").trim());
          const validRows = [];
          let dupCount = 0;

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length < 3) continue;

            const row = {};
            headers.forEach((header, index) => {
              row[header] = (values[index] || '').replace(/^"|"$/g, "").trim();
            });

            // 관대한 키워드 매칭 (예: '학번'만 적혀있든 '학번(필수)'로 적혀있든 인식)
            const getVal = (keyword) => {
              const key = Object.keys(row).find(k => k.includes(keyword));
              return key ? row[key] : '';
            };

            const sNum = getVal('학번');
            const sName = getVal('이름');
            const sPwd = getVal('비밀'); // 비밀번호, 비번 등 포괄적 매칭

            if (sNum && sName && sPwd) {
              if (checkDuplicate(sNum, sName)) dupCount++;
              validRows.push({ sNum, sName, sPwd });
            }
          }

          const proceedUpload = async () => {
            if (validRows.length === 0) {
              customAlert('오류', '등록할 수 있는 데이터가 없습니다.\n첫 줄에 [학번, 이름, 비밀번호]가 정확히 적혀있는지 확인해주세요.');
              e.target.value = '';
              return;
            }

            const batch = writeBatch(db);
            validRows.forEach(r => {
               const newRef = doc(collection(db, "students"));
               batch.set(newRef, {
                  classCode: userData.classCode,
                  teacherId: userData.id,
                  studentNumber: r.sNum,
                  name: r.sName,
                  password: r.sPwd,
                  str: 0, cha: 0, int: 0, coins: 0,
                  createdAt: serverTimestamp()
               });
            });
            await batch.commit();
            customAlert('업로드 완료', `${validRows.length}명의 학생이 성공적으로 일괄 등록되었습니다.`);
            e.target.value = '';
          };

          if (dupCount > 0) {
            customConfirm(
              `⚠️ 중복 알림`,
              `업로드 명단 중 ${dupCount}명이 기존 학번 또는 이름과 중복됩니다.\n중복을 무시하고 그대로 모두 추가하시겠습니까?`,
              proceedUpload
            );
          } else {
            proceedUpload();
          }
        } catch (error) {
          console.error(error);
          customAlert('오류', '파일을 읽는 중 문제가 발생했습니다. 엑셀에서 다시 CSV로 저장해 보세요.');
        }
      };
      
      // 파일 데이터를 바이트 버퍼 형태로 읽어옵니다. (인코딩 자동 판별을 위해)
      reader.readAsArrayBuffer(file);
    };

    const handleDeleteStudent = (studentId) => {
      customConfirm('학생 삭제', '정말 이 학생을 삭제하시겠습니까?', async () => {
        await deleteDoc(doc(db, "students", studentId));
        setSelectedStudents(prev => prev.filter(id => id !== studentId));
        customAlert('삭제 완료', '학생 정보가 정상적으로 삭제되었습니다.');
      });
    };

    const toggleSelectAll = (e) => {
      const filtered = selectedClassGroup === 'All' ? students : students.filter(s => getClassGroup(s.studentNumber) === selectedClassGroup);
      if (e.target.checked) setSelectedStudents(filtered.map(s => s.id));
      else setSelectedStudents([]);
    };

    const toggleSelect = (id) => {
      setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleBatchDelete = () => {
      if (selectedStudents.length === 0) return customAlert('알림', '선택된 학생이 없습니다.');
      customConfirm(
        '일괄 삭제',
        `⚠️ 선택한 ${selectedStudents.length}명의 학생을 정말 모두 삭제하시겠습니까?`,
        async () => {
          const batch = writeBatch(db);
          selectedStudents.forEach(id => batch.delete(doc(db, "students", id)));
          await batch.commit();
          setSelectedStudents([]);
          customAlert('삭제 완료', '선택한 학생들이 삭제되었습니다.');
        }
      );
    };

    const handleAddQuest = async (e) => {
      e.preventDefault();
      await addDoc(collection(db, "quests"), {
        classCode: userData.classCode,
        title: e.target.title.value,
        stat: e.target.stat.value,
        reward: Number(e.target.reward.value),
        createdAt: serverTimestamp()
      });
      e.target.reset();
    };

    const handleDeleteQuest = async (id) => {
      await deleteDoc(doc(db, "quests", id));
    };

    const handleAddShopItem = async (e) => {
      e.preventDefault();
      await addDoc(collection(db, "shopItems"), {
        classCode: userData.classCode,
        name: e.target.name.value,
        price: Number(e.target.price.value),
        effect: e.target.effect.value,
        createdAt: serverTimestamp()
      });
      e.target.reset();
    };

    const handleDeleteShopItem = async (id) => {
      await deleteDoc(doc(db, "shopItems", id));
    };

    const getClassGroup = (studentNumber) => {
      if (!studentNumber || studentNumber.length < 3) return '기타';
      const grade = studentNumber.substring(0, 1);
      const cls = studentNumber.substring(1, 3).replace(/^0+/, '');
      return `${grade}-${cls}`;
    };

    const classGroups = ['All', ...new Set(students.map(s => getClassGroup(s.studentNumber)))].sort();

    const filteredStudents = selectedClassGroup === 'All' 
      ? students 
      : students.filter(s => getClassGroup(s.studentNumber) === selectedClassGroup);

    const handleRequestAction = async (req, isApproved) => {
      const studentDocRef = doc(db, "students", req.studentDocId);
      const studentSnap = await getDoc(studentDocRef);
      
      const notifMsg = isApproved 
          ? `[${req.targetName}] 요청이 승인되었습니다! 🎉` 
          : `[${req.targetName}] 요청이 반려되었습니다. 🥲`;

      const notification = {
         message: notifMsg,
         timestamp: new Date().getTime()
      };

      if (isApproved && studentSnap.exists()) {
        const sData = studentSnap.data();
        if (req.type === 'quest') {
          const currentStat = sData[req.rewardStat.toLowerCase()] || 0;
          await updateDoc(studentDocRef, {
            [req.rewardStat.toLowerCase()]: currentStat + req.rewardAmount,
            lastNotification: notification
          });
        } else if (req.type === 'shop') {
          if (Number(sData.coins) >= Number(req.price)) {
            await updateDoc(studentDocRef, {
              coins: Number(sData.coins) - Number(req.price),
              lastNotification: notification
            });
          } else {
            customAlert('오류', '학생의 코인이 부족합니다.');
            return;
          }
        }
      } else if (!isApproved && studentSnap.exists()) {
        await updateDoc(studentDocRef, { lastNotification: notification });
      }
      
      await updateDoc(doc(db, "requests", req.id), {
        status: isApproved ? 'approved' : 'rejected'
      });
    };

    return (
      <div className="min-h-screen w-full bg-slate-100 font-sans text-slate-800 flex flex-col">
        <div className="flex-grow w-full max-w-7xl mx-auto space-y-6 p-4 md:p-8 flex flex-col relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border-t-4 border-blue-500 gap-4 shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                🏫 {userData.name} 선생님 대시보드
              </h1>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="bg-purple-50 px-4 py-2 rounded-xl border border-purple-200 flex items-center shadow-inner">
                <span className="text-sm text-purple-800 font-semibold mr-3">학생 입장 코드</span>
                <span className="text-xl font-black text-purple-600 tracking-widest bg-white px-3 py-1 rounded-lg border border-purple-100 shadow-sm">{userData.classCode}</span>
              </div>
              <button onClick={() => setShowGuideModal(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition text-sm cursor-pointer pointer-events-auto">
                <BookOpen size={18} /> 진화 가이드
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition ml-2 font-medium text-sm bg-slate-100 hover:bg-red-50 px-3 py-2.5 rounded-xl cursor-pointer pointer-events-auto">
                <LogOut size={18} /> 로그아웃
              </button>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button 
              className={`py-3 px-6 font-bold text-base rounded-t-xl transition cursor-pointer pointer-events-auto ${activeTab === 'studentManagement' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 border-b-0'}`}
              onClick={() => setActiveTab('studentManagement')}
            >
              학생 및 승인 관리
            </button>
            <button 
              className={`py-3 px-6 font-bold text-base rounded-t-xl transition cursor-pointer pointer-events-auto ${activeTab === 'questManagement' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 border-b-0'}`}
              onClick={() => setActiveTab('questManagement')}
            >
              퀘스트 및 상점 관리
            </button>
          </div>

          <div className="flex-grow w-full pb-10">
            {activeTab === 'studentManagement' && (
              <div className="space-y-6 animate-fadeIn">
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">🔔 승인 대기열</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {requests.filter(r => r.status === 'pending').length === 0 ? (
                      <div className="col-span-full p-8 text-center text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        대기 중인 요청이 없습니다.
                      </div>
                    ) : (
                      requests.filter(r => r.status === 'pending').map(req => (
                        <div key={req.id} className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition">
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-slate-800 font-bold block">{req.studentName} 용사</span>
                                <span className="text-xs text-slate-500">
                                  {req.studentId} • {typeof req.createdAt === 'object' && req.createdAt !== null ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : req.createdAt}
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${req.type === 'quest' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}>
                                {req.type === 'quest' ? '퀘스트 수행' : '상점 교환'}
                              </span>
                            </div>
                            
                            <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="text-sm font-bold text-slate-700 block mb-1">{req.targetName}</span>
                              {req.type === 'quest' && <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">보상: {req.rewardStat} +{req.rewardAmount}</span>}
                              {req.type === 'shop' && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">요청: 코인 -{req.price}</span>}
                              
                              {req.submittedText && (
                                <p className="mt-2 text-sm text-slate-700 break-words bg-white p-2 rounded border border-slate-200 font-sans">"{req.submittedText}"</p>
                              )}
                              {req.submittedImageUrl && (
                                <div className="mt-2 rounded overflow-hidden border border-slate-200 aspect-video bg-black flex items-center justify-center">
                                  <img src={req.submittedImageUrl} alt="제출 이미지" className="max-h-full object-contain" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button onClick={() => handleRequestAction(req, true)} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-1 transition cursor-pointer pointer-events-auto"><CheckCircle2 size={16}/> 승인</button>
                            <button onClick={() => handleRequestAction(req, false)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-1 transition cursor-pointer pointer-events-auto"><XCircle size={16}/> 반려</button>
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
                      <button 
                        onClick={() => {
                          if (selectedStudents.length === 0) return customAlert('알림', '선택된 학생이 없습니다. 표 맨 앞의 체크박스를 눌러주세요.');
                          setShowBatchModal(true);
                        }} 
                        className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold transition border border-blue-200 cursor-pointer pointer-events-auto"
                      >
                        <CheckSquare size={16}/> 선택 스탯/씨앗 일괄 부여
                      </button>
                      <button onClick={handleBatchDelete} className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold transition border border-red-200 cursor-pointer pointer-events-auto">
                        <Trash2 size={16}/> 선택 일괄 삭제
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {classGroups.map(group => (
                      <button
                        key={group}
                        onClick={() => setSelectedClassGroup(group)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition cursor-pointer pointer-events-auto ${selectedClassGroup === group ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {group === 'All' ? '전체 보기' : `${group}반`}
                      </button>
                    ))}
                  </div>
                  
                  <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead className="sticky top-0 bg-slate-50 z-20 shadow-sm">
                        <tr className="text-slate-600 border-b border-slate-200 text-sm">
                          <th className="p-3 text-center w-12">
                            <input type="checkbox" onChange={toggleSelectAll} checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0} className="w-4 h-4 cursor-pointer pointer-events-auto" />
                          </th>
                          <th className="p-3 font-semibold text-center w-20">학번</th>
                          <th className="p-3 font-semibold w-24">이름</th>
                          <th className="p-3 font-semibold text-center w-32">레벨/직업</th>
                          <th className="p-3 font-semibold text-red-500 text-center">체력(STR)</th>
                          <th className="p-3 font-semibold text-amber-500 text-center">친화력(CHA)</th>
                          <th className="p-3 font-semibold text-blue-500 text-center">정신력(INT)</th>
                          <th className="p-3 font-semibold text-emerald-600 text-center">씨앗(코인)</th>
                          <th className="p-3 font-semibold text-center w-24">관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length === 0 && <tr><td colSpan="9" className="p-8 text-center text-slate-400">등록된 학생이 없습니다.</td></tr>}
                        {filteredStudents.map(s => {
                          const level = calculateLevel(s.str, s.cha, s.int);
                          const role = calculateRole(s.str, s.cha, s.int);
                          return (
                            <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                              <td className="p-3 text-center">
                                <input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => toggleSelect(s.id)} className="w-4 h-4 cursor-pointer pointer-events-auto" />
                              </td>
                              <td className="p-3 text-center text-sm text-slate-700 font-medium">{s.studentNumber}</td>
                              <td className="p-3 font-bold text-slate-800">{s.name}</td>
                              <td className="p-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-bold">Lv.{level}</span>
                                  <span className="text-xs font-semibold text-slate-600">{role}</span>
                                </div>
                              </td>
                              <td className="p-3 text-center"><input type="number" defaultValue={s.str} onBlur={(e) => { if(Number(e.target.value)!==s.str) handleUpdateStat(s.id, 'str', e.target.value) }} className="w-16 border border-slate-200 rounded p-1 text-center bg-red-50 focus:bg-white outline-none focus:border-red-400 font-bold text-slate-900 pointer-events-auto" /></td>
                              <td className="p-3 text-center"><input type="number" defaultValue={s.cha} onBlur={(e) => { if(Number(e.target.value)!==s.cha) handleUpdateStat(s.id, 'cha', e.target.value) }} className="w-16 border border-slate-200 rounded p-1 text-center bg-amber-50 focus:bg-white outline-none focus:border-amber-400 font-bold text-slate-900 pointer-events-auto" /></td>
                              <td className="p-3 text-center"><input type="number" defaultValue={s.int} onBlur={(e) => { if(Number(e.target.value)!==s.int) handleUpdateStat(s.id, 'int', e.target.value) }} className="w-16 border border-slate-200 rounded p-1 text-center bg-blue-50 focus:bg-white outline-none focus:border-blue-400 font-bold text-slate-900 pointer-events-auto" /></td>
                              <td className="p-3 text-center"><input type="number" defaultValue={s.coins} onBlur={(e) => { if(Number(e.target.value)!==s.coins) handleUpdateStat(s.id, 'coins', e.target.value) }} className="w-16 border border-slate-200 rounded p-1 text-center bg-emerald-50 focus:bg-white outline-none focus:border-emerald-400 font-bold text-slate-900 pointer-events-auto" /></td>
                              <td className="p-3 text-center flex justify-center gap-2">
                                <button onClick={() => setEditingStudent(s)} className="text-blue-500 hover:text-blue-600 transition p-1 bg-blue-50 rounded cursor-pointer pointer-events-auto" title="상세수정"><Edit2 size={16}/></button>
                                <button onClick={() => handleDeleteStudent(s.id)} className="text-red-400 hover:text-red-500 transition p-1 bg-red-50 rounded cursor-pointer pointer-events-auto" title="삭제"><Trash2 size={16}/></button>
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
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">📥 학생 명단 일괄 업로드</h2>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">첫 줄에 <span className="font-bold text-blue-600">학번, 이름, 비밀번호</span> 헤더가 있는 CSV 엑셀 파일을 업로드하세요.</p>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-slate-100 transition group pointer-events-auto">
                        <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" onClick={(e) => e.target.value = null} />
                        <div className="text-sm text-slate-600 font-bold group-hover:text-blue-600 flex flex-col items-center gap-2">
                          <Upload size={24} className="text-slate-400 group-hover:text-blue-500"/>
                          CSV 파일 선택하기
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">➕ 개별 학생 추가</h2>
                    <form onSubmit={handleAddStudent} className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 mb-1">학번 입력</label>
                          <input type="text" name="studentNumber" required placeholder="예: 10101" className="w-full text-slate-900 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition pointer-events-auto" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 mb-1">이름 입력</label>
                          <input type="text" name="studentName" required placeholder="예: 김자람" className="w-full text-slate-900 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition pointer-events-auto" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">초기 비밀번호 지정</label>
                        <input type="text" name="password" required placeholder="예: 1234" className="w-full text-slate-900 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition pointer-events-auto" />
                      </div>
                      <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-lg transition shadow-md mt-1 cursor-pointer pointer-events-auto">학생 추가하기</button>
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
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-emerald-700 mb-1">의뢰명 (퀘스트 이름)</label>
                      <input type="text" name="title" required placeholder="예: 아침 30분 걷기" className="w-full text-slate-900 border border-emerald-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 bg-white pointer-events-auto" />
                    </div>
                    <div className="w-full md:w-auto">
                      <label className="block text-xs font-bold text-emerald-700 mb-1">보상 종류</label>
                      <select name="stat" required className="w-full text-slate-900 border border-emerald-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 bg-white font-medium pointer-events-auto">
                        <option value="STR">체력 (STR)</option>
                        <option value="CHA">친화력 (CHA)</option>
                        <option value="INT">정신력 (INT)</option>
                        <option value="COINS">씨앗 (코인)</option>
                      </select>
                    </div>
                    <div className="w-full md:w-32">
                      <label className="block text-xs font-bold text-emerald-700 mb-1">보상 수치</label>
                      <input type="number" name="reward" required placeholder="예: 5" className="w-full text-slate-900 border border-emerald-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 bg-white pointer-events-auto" />
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold whitespace-nowrap shadow-md transition cursor-pointer pointer-events-auto">퀘스트 등록</button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {quests.map(q => (
                      <div key={q.id} className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between shadow-sm hover:border-emerald-300 transition group">
                        <div>
                          <span className={`text-xs font-bold px-2 py-1 rounded w-fit mb-2 inline-block ${q.stat === 'STR' ? 'bg-red-100 text-red-600' : q.stat === 'CHA' ? 'bg-amber-100 text-amber-600' : q.stat === 'INT' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            보상: {q.stat} +{q.reward}
                          </span>
                          <p className="font-bold text-slate-800 leading-tight">{q.title}</p>
                        </div>
                        <button onClick={() => handleDeleteQuest(q.id)} className="mt-4 text-xs font-bold text-slate-400 hover:text-red-500 self-end opacity-0 group-hover:opacity-100 transition cursor-pointer pointer-events-auto">삭제</button>
                      </div>
                    ))}
                    {quests.length === 0 && <div className="col-span-full p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">등록된 퀘스트가 없습니다.</div>}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-700">💎 비밀 상점 (커스텀 보상 관리)</h2>
                  
                  <form onSubmit={handleAddShopItem} className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-end mb-6 shadow-inner">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-amber-700 mb-1">상품명</label>
                      <input type="text" name="name" required placeholder="예: 자리바꾸기권" className="w-full text-slate-900 border border-amber-200 rounded-lg p-2.5 text-sm outline-none focus:border-amber-500 bg-white pointer-events-auto" />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="block text-xs font-bold text-amber-700 mb-1">가격(씨앗)</label>
                      <input type="number" name="price" required placeholder="예: 50" className="w-full text-slate-900 border border-amber-200 rounded-lg p-2.5 text-sm outline-none focus:border-amber-500 bg-white pointer-events-auto" />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-amber-700 mb-1">효과 및 설명</label>
                      <input type="text" name="effect" required placeholder="원하는 짝궁 지정 가능" className="w-full text-slate-900 border border-amber-200 rounded-lg p-2.5 text-sm outline-none focus:border-amber-500 bg-white pointer-events-auto" />
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg font-bold whitespace-nowrap shadow-md transition cursor-pointer pointer-events-auto">상품 등록</button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shopItems.map(item => (
                      <div key={item.id} className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between shadow-sm hover:border-amber-300 transition group">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-slate-800">{item.name}</span>
                            <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-xs">🌱 {item.price}</span>
                          </div>
                          <p className="text-sm text-slate-600">{item.effect}</p>
                        </div>
                        <button onClick={() => handleDeleteShopItem(item.id)} className="mt-4 text-xs font-bold text-slate-400 hover:text-red-500 self-end opacity-0 group-hover:opacity-100 transition cursor-pointer pointer-events-auto">삭제</button>
                      </div>
                    ))}
                    {shopItems.length === 0 && <div className="col-span-full p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">등록된 상품이 없습니다.</div>}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
        
        {/* 교사 화면 최상단 모달 렌더링 */}
        {showBatchModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fadeIn overflow-y-auto pointer-events-auto">
            <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative m-auto">
              <button onClick={() => setShowBatchModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full p-1 transition z-50 cursor-pointer pointer-events-auto"><X size={20}/></button>
              <h3 className="text-xl font-bold mb-6 text-blue-600 flex items-center gap-2"><CheckSquare size={20}/> 선택 학생 스탯/씨앗 일괄 부여</h3>
              <p className="text-sm text-slate-600 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">선택된 <strong className="text-blue-700">{selectedStudents.length}명</strong>의 학생들에게 추가(또는 차감)할 값만 입력하세요. (비워두면 0 처리)</p>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const addStr = Number(e.target.str.value) || 0;
                const addCha = Number(e.target.cha.value) || 0;
                const addInt = Number(e.target.int.value) || 0;
                const addCoins = Number(e.target.coins.value) || 0;

                if (addStr === 0 && addCha === 0 && addInt === 0 && addCoins === 0) {
                  customAlert('알림', '부여할 값을 하나 이상 입력해주세요.');
                  return;
                }

                const batch = writeBatch(db);
                selectedStudents.forEach(id => {
                   const s = students.find(x => x.id === id);
                   if (s) {
                     batch.update(doc(db, "students", id), { 
                       str: (s.str || 0) + addStr,
                       cha: (s.cha || 0) + addCha,
                       int: (s.int || 0) + addInt,
                       coins: (s.coins || 0) + addCoins
                     });
                   }
                });
                await batch.commit();
                setShowBatchModal(false);
                setSelectedStudents([]);
                customAlert('일괄 부여 완료', `${selectedStudents.length}명의 학생에게 일괄 적용되었습니다.`);
              }} className="space-y-4 relative z-10">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-red-600 mb-1">체력 (STR) 증감</label>
                    <input type="number" name="str" placeholder="예: 5 또는 -2" className="w-full border border-red-200 rounded-lg p-2.5 text-sm outline-none focus:border-red-400 font-bold text-slate-900 pointer-events-auto" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-600 mb-1">친화력 (CHA) 증감</label>
                    <input type="number" name="cha" placeholder="예: 5 또는 -2" className="w-full border border-amber-200 rounded-lg p-2.5 text-sm outline-none focus:border-amber-400 font-bold text-slate-900 pointer-events-auto" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-600 mb-1">정신력 (INT) 증감</label>
                    <input type="number" name="int" placeholder="예: 5 또는 -2" className="w-full border border-blue-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-400 font-bold text-slate-900 pointer-events-auto" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 mb-1">씨앗 (코인) 증감</label>
                    <input type="number" name="coins" placeholder="예: 5 또는 -2" className="w-full border border-emerald-300 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 font-bold text-slate-900 pointer-events-auto" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg mt-2 cursor-pointer pointer-events-auto">일괄 적용하기</button>
              </form>
            </div>
          </div>
        )}

        {editingStudent && (
          <div key={editingStudent.id} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fadeIn overflow-y-auto pointer-events-auto">
            <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative m-auto pointer-events-auto">
              <button onClick={() => setEditingStudent(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full p-1 transition z-50 cursor-pointer pointer-events-auto"><X size={20}/></button>
              <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2"><Edit2 size={20} className="text-blue-500"/> 개별 학생 상세 수정</h3>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const num = e.target.num.value;
                const name = e.target.name.value;
                
                const dup = students.find(s => s.id !== editingStudent.id && (String(s.studentNumber).trim() === String(num).trim() || String(s.name).trim() === String(name).trim()));
                if (dup) {
                   customConfirm(
                     '⚠️ [중복 알림]',
                     `이미 동일한 학번(${dup.studentNumber})이나 이름(${dup.name})이 존재합니다.\n그래도 수정사항을 강제로 저장하시겠습니까?`,
                     async () => {
                       await updateDoc(doc(db, "students", editingStudent.id), {
                         studentNumber: num,
                         name: name,
                         password: e.target.pwd.value,
                         str: Number(e.target.str.value),
                         cha: Number(e.target.cha.value),
                         int: Number(e.target.int.value),
                         coins: Number(e.target.coins.value)
                       });
                       setEditingStudent(null);
                       customAlert('수정 완료', '학생 정보가 수정되었습니다.');
                     }
                   );
                   return;
                }

                await updateDoc(doc(db, "students", editingStudent.id), {
                  studentNumber: num,
                  name: name,
                  password: e.target.pwd.value,
                  str: Number(e.target.str.value),
                  cha: Number(e.target.cha.value),
                  int: Number(e.target.int.value),
                  coins: Number(e.target.coins.value)
                });
                setEditingStudent(null);
                customAlert('수정 완료', '학생 정보가 안전하게 수정되었습니다.');
              }} className="space-y-4 relative z-10">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1">학번</label>
                    <input type="text" name="num" defaultValue={editingStudent.studentNumber} required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 text-slate-800 font-bold pointer-events-auto" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1">이름</label>
                    <input type="text" name="name" defaultValue={editingStudent.name} required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 text-slate-800 font-bold pointer-events-auto" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">비밀번호</label>
                    <input type="text" name="pwd" defaultValue={editingStudent.password} required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 text-slate-800 font-bold pointer-events-auto" />
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-red-600 mb-1">체력 (STR)</label>
                    <input type="number" name="str" defaultValue={editingStudent.str} required className="w-full border border-red-200 rounded-lg p-2.5 text-sm outline-none focus:border-red-400 font-bold text-slate-800 pointer-events-auto" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-600 mb-1">친화력 (CHA)</label>
                    <input type="number" name="cha" defaultValue={editingStudent.cha} required className="w-full border border-amber-200 rounded-lg p-2.5 text-sm outline-none focus:border-amber-400 font-bold text-slate-800 pointer-events-auto" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-600 mb-1">정신력 (INT)</label>
                    <input type="number" name="int" defaultValue={editingStudent.int} required className="w-full border border-blue-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-400 font-bold text-slate-800 pointer-events-auto" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 mb-1">씨앗 (코인)</label>
                    <input type="number" name="coins" defaultValue={editingStudent.coins} required className="w-full border border-emerald-300 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 font-bold text-slate-800 pointer-events-auto" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition shadow-md mt-4 cursor-pointer pointer-events-auto">수정 내용 저장</button>
              </form>
            </div>
          </div>
        )}

        {/* 교사 화면 최상단에 모달 컴포넌트 직접 렌더링 */}
        {showGuideModal && <GuideModal />}
        <AlertModalUI />
      </div>
    );
  }

  if (view === 'student' && userData) {
    const level = calculateLevel(userData.str, userData.cha, userData.int);
    const role = calculateRole(userData.str, userData.cha, userData.int);
    const asset = HERO_ASSETS[role] || HERO_ASSETS['꼬마 새싹']; 
    
    const maxStat = Math.max(150, userData.str, userData.cha, userData.int);

    const chartData = [
      { subject: '체력 (STR)', A: userData.str, fullMark: maxStat },
      { subject: '친화력 (CHA)', A: userData.cha, fullMark: maxStat },
      { subject: '정신력 (INT)', A: userData.int, fullMark: maxStat },
    ];

    const handleQuestSubmit = async (e) => {
      e.preventDefault();
      const text = e.target.text.value;
      
      await addDoc(collection(db, "requests"), {
        classCode: userData.classCode,
        studentDocId: userData.id,
        studentId: userData.studentNumber,
        studentName: userData.name,
        type: 'quest',
        targetId: selectedQuest.id,
        targetName: selectedQuest.title,
        rewardStat: selectedQuest.stat,
        rewardAmount: selectedQuest.reward,
        submittedText: text,
        submittedImageUrl: questImageBase64,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setShowQuestSubmit(false);
      setSelectedQuest(null);
      setQuestImageBase64('');
      customAlert('제출 완료', '선생님께 퀘스트 검토를 요청했습니다!');
    };

    const handleBuyRequest = (item) => {
      if (Number(userData.coins) < Number(item.price)) {
        customAlert('잔액 부족', '보유한 씨앗(코인)이 부족합니다!');
        return;
      }
      customConfirm('아이템 교환', `'${item.name}' 아이템 교환을 요청할까요?`, async () => {
        await addDoc(collection(db, "requests"), {
          classCode: userData.classCode,
          studentDocId: userData.id,
          studentId: userData.studentNumber,
          studentName: userData.name,
          type: 'shop',
          targetId: item.id,
          targetName: item.name,
          price: item.price,
          status: 'pending',
          createdAt: serverTimestamp()
        });
        customAlert('신청 완료', '선생님께 상점 교환을 요청했습니다!');
      });
    };

    return (
      <div className="min-h-screen w-full font-sans text-white flex flex-col bg-slate-900 bg-cover bg-center bg-fixed p-4 md:p-8" style={{ backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.70), rgba(15, 23, 42, 0.70)), url('/images/bg_forest.jpg')" }}>
        <div className="w-full max-w-5xl mx-auto flex flex-col flex-grow space-y-6">
          
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl px-6 h-16 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <Shield className="text-emerald-500" size={24} />
              <span className="font-bold text-lg text-white">숲속 포털</span>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setShowGuideModal(true)} className="hidden md:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-1.5 px-3 rounded-xl shadow-md transition text-xs border border-slate-600 cursor-pointer pointer-events-auto">
                <BookOpen size={14} /> 진화 가이드
              </button>
              <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2 shadow-inner">
                <span className="text-base">🌱</span>
                <span className="font-black text-emerald-400">{userData.coins}</span>
              </div>
              <button type="button" onClick={handleLogout} className="text-slate-400 hover:text-white transition p-2 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700 cursor-pointer pointer-events-auto">
                <LogOut size={18}/>
              </button>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800/80 aspect-[4/3] md:aspect-[21/9] bg-black relative flex flex-col items-center justify-end p-6 pb-8">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
              style={{ backgroundImage: `url(${asset.backgroundImage})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-90"></div> 
            
            <div className="relative z-10 flex flex-col items-center">
              <img 
                src={asset.characterImage} 
                alt={role} 
                className="h-48 md:h-64 object-contain mb-2 drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] animate-pulse-slow"
                style={{ animationDuration: '4s' }}
                onError={(e) => { e.target.src = "/images/jaram_stage1_baby.png"; }}
              />
              <div className="text-center">
                <div className="flex justify-center gap-2 mb-2">
                  <span className="bg-emerald-500/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg border border-emerald-400/50">Level {level}</span>
                  <span className="bg-slate-800/80 backdrop-blur text-emerald-300 px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-slate-600">{role}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight">{userData.name}</h2>
              </div>
            </div>
          </div>

          <div className="flex bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/50 shadow-lg">
            {['home', 'quest', 'shop'].map((tabName, idx) => {
              const labels = ['내 정보', '퀘스트 보드', '비밀 상점'];
              const icons = [<Star size={18}/>, <ScrollText size={18}/>, <Shield size={18}/>];
              return (
                <button
                  key={tabName}
                  type="button"
                  onClick={() => setStudentTab(tabName)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition cursor-pointer pointer-events-auto ${studentTab === tabName ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                >
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
                        <Radar 
                          name="능력치" 
                          dataKey="A" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                          fill="#10b981" 
                          fillOpacity={0.4} 
                          dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                          label={{ fill: '#34d399', fontSize: 14, fontWeight: 'bold', position: 'top' }}
                        />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#10b981', fontWeight: 'bold' }}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 flex flex-col shadow-xl">
                  <h3 className="text-lg font-bold text-slate-300 mb-6 border-b border-slate-700 pb-4">상세 능력치</h3>
                  <div className="space-y-8 flex-grow flex flex-col justify-center">
                    <div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-red-400 font-bold flex items-center gap-1"><Shield size={16}/> 체력 (STR)</span>
                        <span className="font-black text-slate-200 text-lg">{userData.str}</span>
                      </div>
                      <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5">
                        <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-1000 relative" style={{ width: `${(userData.str / maxStat) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-amber-400 font-bold flex items-center gap-1"><Heart size={16}/> 친화력 (CHA)</span>
                        <span className="font-black text-slate-200 text-lg">{userData.cha}</span>
                      </div>
                      <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-1000 relative" style={{ width: `${(userData.cha / maxStat) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-blue-400 font-bold flex items-center gap-1"><Brain size={16}/> 정신력 (INT)</span>
                        <span className="font-black text-slate-200 text-lg">{userData.int}</span>
                      </div>
                      <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 relative" style={{ width: `${(userData.int / maxStat) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 p-4 bg-slate-800/80 rounded-xl border border-slate-700/50 text-sm text-slate-300 leading-relaxed text-center font-medium shadow-inner">
                    "{asset.description}"
                  </div>
                </div>
              </div>
            )}

            {studentTab === 'quest' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quests.map(q => (
                  <div key={q.id} className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition flex flex-col justify-between min-h-[140px] shadow-lg">
                    <div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded w-fit mb-3 inline-block uppercase tracking-wider ${q.stat === 'STR' ? 'bg-red-500/20 text-red-400' : q.stat === 'CHA' ? 'bg-amber-500/20 text-amber-400' : q.stat === 'INT' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {q.stat} +{q.reward}
                      </span>
                      <h4 className="font-bold text-lg text-slate-100 leading-snug">{q.title}</h4>
                    </div>
                    <button 
                      type="button"
                      onClick={() => { setSelectedQuest(q); setShowQuestSubmit(true); }}
                      className="mt-4 bg-slate-700 hover:bg-emerald-600 text-white font-bold text-sm py-2.5 rounded-xl transition shadow-lg w-full cursor-pointer pointer-events-auto"
                    >
                      의뢰 수행하기
                    </button>
                  </div>
                ))}
                {quests.length === 0 && <div className="col-span-full p-10 text-center text-slate-400 bg-slate-900/80 rounded-2xl">현재 등록된 퀘스트가 없습니다.</div>}
              </div>
            )}

            {studentTab === 'shop' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shopItems.map(item => (
                  <div key={item.id} className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition flex flex-col justify-between min-h-[140px] shadow-lg">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-lg text-slate-100 leading-snug">{item.name}</h4>
                        <span className="bg-emerald-500/20 text-emerald-400 font-black px-2 py-1 rounded-lg text-xs border border-emerald-500/20">🌱 {item.price}</span>
                      </div>
                      <p className="text-sm text-slate-400">{item.effect}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleBuyRequest(item)}
                      className={`mt-4 font-bold text-sm py-2.5 rounded-xl transition shadow-lg w-full cursor-pointer pointer-events-auto ${Number(userData.coins) >= Number(item.price) ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-700 text-slate-500 opacity-50 cursor-not-allowed'}`}
                    >
                      교환 요청하기
                    </button>
                  </div>
                ))}
                {shopItems.length === 0 && <div className="col-span-full p-10 text-center text-slate-400 bg-slate-900/80 rounded-2xl">상점이 아직 준비 중입니다.</div>}
              </div>
            )}

          </div>

          {showQuestSubmit && selectedQuest && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999] animate-fadeIn overflow-y-auto pointer-events-auto">
              <div className="bg-slate-800 rounded-3xl p-6 md:p-8 relative max-w-md w-full shadow-2xl border border-slate-600 m-auto pointer-events-auto">
                <button type="button" onClick={() => {setShowQuestSubmit(false); setSelectedQuest(null); setQuestImageBase64('');}} className="absolute top-6 right-6 text-slate-400 hover:text-white transition bg-slate-700 p-1 rounded-full cursor-pointer pointer-events-auto z-50">
                  <X size={20} />
                </button>
                <h2 className="text-xl font-bold mb-1 text-white">의뢰 수행 보고</h2>
                <p className="text-sm text-slate-400 mb-6 font-sans">[{selectedQuest.title}] 완료를 선생님께 알립니다.</p>
                
                <form onSubmit={handleQuestSubmit} className="space-y-4 relative z-10">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">수행 소감 (글 작성)</label>
                    <textarea name="text" rows="3" placeholder="내용을 적어주세요." className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition resize-none font-sans pointer-events-auto" required></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">인증 사진 첨부 (선택)</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setQuestImageBase64)} className="w-full bg-slate-900 text-slate-400 border border-slate-700 rounded-xl px-4 py-2 outline-none focus:border-emerald-500 transition font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 cursor-pointer pointer-events-auto" />
                    {questImageBase64 && (
                      <div className="mt-3 relative inline-block">
                        <img src={questImageBase64} alt="미리보기" className="h-32 object-contain rounded-lg border border-slate-600 shadow-md" />
                        <button type="button" onClick={() => setQuestImageBase64('')} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white rounded-full p-1 cursor-pointer pointer-events-auto transition shadow-lg"><X size={14}/></button>
                      </div>
                    )}
                  </div>
                  <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition mt-4 shadow-lg cursor-pointer pointer-events-auto">
                    선생님께 보고하기
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
        
        {/* 학생 화면 최상단에 모달 컴포넌트 직접 렌더링 */}
        {showGuideModal && <GuideModal />}
        <AlertModalUI />
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[9999]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500"></div>
      </div>
    </>
  );
}