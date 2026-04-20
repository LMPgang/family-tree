// 登录系统
const authSystem = {
    // 家族成员账号（用户名: 密码）
    // 修改方法：
    //   1. 给族谱里的人开账号：直接加 "姓名": "密码"
    //   2. 给非族谱成员开账号：加 "用户名": "密码"，然后在 externalUsers 里加一条
    users: {
        "张德厚": "zhang123",
        "张文轩": "zhang123",
        "张明德": "zhang123",
        "张建国": "zhang123",
        "张志远": "zhang123",
        "admin": "admin123",
        // --- 非族谱成员账号（在下面添加）---
        // "亲友李明": "liming123",
    },

    // 非族谱成员的额外信息（用户名: {role, note}）
    // role: 显示的角色，note: 备注
    externalUsers: {
        "admin": { role: "管理员", note: "系统管理员" },
        // "亲友李明": { role: "家族亲友", note: "张建国的好友" },
    },

    // 需要登录才能访问的页面
    protectedPages: ['tree.html', 'members.html', 'map.html', 'activities.html', 'houses.html'],

    // 初始化：从localStorage加载修改过的密码
    init() {
        Object.keys(this.users).forEach(username => {
            const savedPw = localStorage.getItem('familyUserPw_' + username);
            if (savedPw) this.users[username] = savedPw;
        });
    },

    // 检查是否已登录
    isLoggedIn() {
        return sessionStorage.getItem('familyLoggedIn') === 'true';
    },

    // 获取当前用户
    getCurrentUser() {
        return sessionStorage.getItem('familyUserName') || '';
    },

    // 获取用户信息（关联族谱成员或外部成员）
    getUserInfo(username) {
        // 先查族谱成员
        if (typeof familyData !== 'undefined') {
            const member = familyData.members.find(m => m.name === username);
            if (member) return { role: `第${member.generation}代家族成员`, member, isFamily: true };
        }
        // 再查外部成员
        const ext = this.externalUsers[username];
        if (ext) return { role: ext.role, note: ext.note, isFamily: false };
        // 默认
        return { role: '家族成员', isFamily: false };
    },

    // 登录
    login(username, password) {
        this.init(); // 确保加载最新密码
        if (this.users[username] && this.users[username] === password) {
            sessionStorage.setItem('familyLoggedIn', 'true');
            sessionStorage.setItem('familyUserName', username);
            return true;
        }
        return false;
    },

    // 退出登录
    logout() {
        sessionStorage.removeItem('familyLoggedIn');
        sessionStorage.removeItem('familyUserName');
    },

    // 检查当前页面是否需要登录
    checkPageAccess() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (this.protectedPages.includes(currentPage) && !this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // 判断是否是管理员
    isAdmin() {
        return this.isLoggedIn() && this.getCurrentUser() === 'admin';
    },

    // 获取用户上传的头像（优先从sessionStorage读取，确保跨页面一致）
    _getAvatarFromStorage(user) {
        // 先从sessionStorage读取（同一标签页共享，不受file://协议限制）
        try {
            const sessionRaw = sessionStorage.getItem('familyProfile_' + user);
            if (sessionRaw) {
                const data = JSON.parse(sessionRaw);
                if (data.avatar && typeof data.avatar === 'string' && data.avatar.length > 0) {
                    return data.avatar;
                }
            }
        } catch(e) {}
        // 再从localStorage读取
        try {
            const localRaw = localStorage.getItem('familyProfile_' + user);
            if (localRaw) {
                const data = JSON.parse(localRaw);
                if (data.avatar && typeof data.avatar === 'string' && data.avatar.length > 0) {
                    // 同步到sessionStorage，下次读取更快
                    try { sessionStorage.setItem('familyProfile_' + user, localRaw); } catch(e) {}
                    return data.avatar;
                }
            }
        } catch(e) {}
        return '';
    },

    // 更新导航栏显示
    updateNavbar() {
        const loginItem = document.getElementById('navLoginItem');
        if (!loginItem) return;

        if (this.isLoggedIn()) {
            const user = this.getCurrentUser();
            const avatarSrc = this._getAvatarFromStorage(user);

            let avatarHTML = '';
            if (avatarSrc) {
                avatarHTML = `<img src="${avatarSrc}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2.5px solid #DAA520;" onerror="this.style.display='none';this.nextElementSibling&&this.nextElementSibling.style&&(this.nextElementSibling.style.display='inline-flex')">`;
            } else {
                avatarHTML = `<span style="display:inline-flex;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#A0522D,#CD853F);color:#FFF8DC;align-items:center;justify-content:center;font-size:1.2rem;border:2.5px solid #DAA520;font-family:'KaiTi','SimSun',serif;">${user.charAt(0)}</span>`;
            }
            loginItem.innerHTML = `<a href="profile.html" style="display:flex;flex-direction:row;align-items:center;gap:8px;padding:0.2rem 0.6rem;min-width:auto;">${avatarHTML}<span style="color:#FFF8DC;font-size:0.9rem;font-family:'KaiTi','SimSun',serif;text-shadow:1px 1px 2px rgba(0,0,0,0.3);">${user}</span></a>`;
        } else {
            loginItem.innerHTML = `<a href="login.html"><span class="nav-icon">&#9967;</span><span class="nav-text">登录</span></a>`;
        }
    },

    // 获取用户头像URL（供其他模块调用）
    getUserAvatar(username) {
        return this._getAvatarFromStorage(username);
    },

    // ===== Admin 账号管理 =====
    // 获取所有用户列表
    getAllUsers() {
        this.init();
        return Object.keys(this.users).map(name => ({
            username: name,
            password: this.users[name],
            isAdmin: name === 'admin',
            info: this.getUserInfo(name)
        }));
    },

    // 修改用户密码
    changeUserPassword(username, newPassword) {
        if (!this.users[username]) return { success: false, msg: '用户不存在' };
        if (username === 'admin' && this.getCurrentUser() !== 'admin') return { success: false, msg: '不能修改管理员密码' };
        this.users[username] = newPassword;
        localStorage.setItem('familyUserPw_' + username, newPassword);
        return { success: true, msg: '密码修改成功' };
    },

    // 修改用户名（重命名）
    renameUser(oldName, newName) {
        if (!this.users[oldName]) return { success: false, msg: '原用户不存在' };
        if (oldName === 'admin') return { success: false, msg: '不能重命名admin账户' };
        if (this.users[newName]) return { success: false, msg: '新用户名已存在' };
        if (!newName.trim()) return { success: false, msg: '用户名不能为空' };

        // 迁移密码
        const pw = this.users[oldName];
        delete this.users[oldName];
        this.users[newName] = pw;

        // 迁移localStorage中的密码
        const savedPw = localStorage.getItem('familyUserPw_' + oldName);
        if (savedPw) {
            localStorage.removeItem('familyUserPw_' + oldName);
            localStorage.setItem('familyUserPw_' + newName, savedPw);
        }

        // 迁移profile数据
        const profileKey = 'familyProfile_' + oldName;
        const newProfileKey = 'familyProfile_' + newName;
        try {
            const localData = localStorage.getItem(profileKey);
            if (localData) {
                localStorage.removeItem(profileKey);
                localStorage.setItem(newProfileKey, localData);
            }
            const sessionData = sessionStorage.getItem(profileKey);
            if (sessionData) {
                sessionStorage.removeItem(profileKey);
                sessionStorage.setItem(newProfileKey, sessionData);
            }
        } catch(e) {}

        // 迁移externalUsers
        if (this.externalUsers[oldName]) {
            this.externalUsers[newName] = this.externalUsers[oldName];
            delete this.externalUsers[oldName];
        }

        // 如果重命名的是当前登录用户，更新session
        if (this.getCurrentUser() === oldName) {
            sessionStorage.setItem('familyUserName', newName);
        }

        return { success: true, msg: '用户名修改成功' };
    },

    // 删除用户
    deleteUser(username) {
        if (!this.users[username]) return { success: false, msg: '用户不存在' };
        if (username === 'admin') return { success: false, msg: '不能删除admin账户' };

        delete this.users[username];
        localStorage.removeItem('familyUserPw_' + username);

        // 清理profile数据
        try {
            localStorage.removeItem('familyProfile_' + username);
            sessionStorage.removeItem('familyProfile_' + username);
        } catch(e) {}

        // 清理externalUsers
        delete this.externalUsers[username];

        return { success: true, msg: '用户删除成功' };
    },

    // 添加新用户
    addUser(username, password) {
        if (this.users[username]) return { success: false, msg: '用户名已存在' };
        if (!username.trim()) return { success: false, msg: '用户名不能为空' };
        if (!password.trim()) return { success: false, msg: '密码不能为空' };

        this.users[username] = password;
        localStorage.setItem('familyUserPw_' + username, password);
        return { success: true, msg: '用户添加成功' };
    }
};

// 退出登录处理（仅在个人中心页面调用）
function handleLogout() {
    authSystem.logout();
    window.location.href = 'index.html';
}

// 页面加载时检查权限和更新导航
document.addEventListener('DOMContentLoaded', () => {
    authSystem.init();
    // 将localStorage中的用户profile数据同步到sessionStorage
    // 确保跨页面导航时头像等数据一致
    if (authSystem.isLoggedIn()) {
        const user = authSystem.getCurrentUser();
        try {
            const localRaw = localStorage.getItem('familyProfile_' + user);
            if (localRaw && !sessionStorage.getItem('familyProfile_' + user)) {
                sessionStorage.setItem('familyProfile_' + user, localRaw);
            }
        } catch(e) {}
    }
    authSystem.checkPageAccess();
    authSystem.updateNavbar();
});
