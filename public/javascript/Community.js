// ============================================
// API 호출 함수
// ============================================
const API_BASE = '/board';

async function fetchAPI(url, options = {}) {
	try {
		const response = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
			},
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || '요청 실패');
		}

		return await response.json();
	} catch (err) {
		console.error('API 오류:', err);
		throw err;
	}
}

// ============================================
// 상태 관리
// ============================================
const state = {
	posts: [],
	currentPage: 1,
	postsPerPage: 7,
	totalPosts: 0,
	currentPostId: null,
	comments: [],
	isLoggedIn: false,
	currentUser: null,
	isEditMode: false,
	editingPostId: null,
};

// ============================================
// DOM 요소 캐싱
// ============================================
const elements = {
	boardSection: null,
	writeSection: null,
	postDetailSection: null,
	boardBody: null,
	pagination: null,
	sidebar: null,
	writeBtn: null,
};

function cacheElements() {
	elements.boardSection = document.getElementById('boardSection');
	elements.writeSection = document.getElementById('writeSection');
	elements.postDetailSection = document.getElementById('postDetailSection');
	elements.boardBody = document.getElementById('board-body');
	elements.pagination = document.getElementById('pagination');
	elements.sidebar = document.getElementById('side-bar');
	elements.writeBtn = document.getElementById('writeBtn');
}

// ============================================
// 로그인 상태 확인
// ============================================
async function checkLoginStatus() {
	try {
		const response = await fetch('/board/check-session');
		const data = await response.json();
		state.isLoggedIn = data.loggedIn;
		state.currentUser = data.user;
	} catch (err) {
		console.error('로그인 상태 확인 오류:', err);
		state.isLoggedIn = false;
	}
}

// ============================================
// 화면 전환
// ============================================
function showSection(sectionName) {
	elements.boardSection.style.display = 'none';
	elements.writeSection.style.display = 'none';
	elements.postDetailSection.style.display = 'none';

	if (elements.writeBtn) {
		elements.writeBtn.style.display = sectionName === 'board' ? 'inline-flex' : 'none';
	}

	switch (sectionName) {
		case 'board':
			elements.boardSection.style.display = 'block';
			break;
		case 'write':
			elements.writeSection.style.display = 'block';
			break;
		case 'detail':
			elements.postDetailSection.style.display = 'block';
			break;
	}
}

// ============================================
// 게시글 목록 조회 및 렌더링
// ============================================
async function loadPosts() {
	try {
		const data = await fetchAPI(
			`${API_BASE}/posts?page=${state.currentPage}&limit=${state.postsPerPage}`
		);

		state.posts = data.posts;
		state.totalPosts = data.total;
		renderPosts();
	} catch (err) {
		alert('게시글을 불러오는데 실패했습니다.');
	}
}

function renderPosts() {
	elements.boardBody.innerHTML = '';

	if (state.posts.length === 0) {
		elements.boardBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
          작성된 게시글이 없습니다.
        </td>
      </tr>
    `;
		elements.pagination.innerHTML = '';
		return;
	}

	state.posts.forEach((post) => {
		const row = document.createElement('tr');
		const date = new Date(post.created_at).toLocaleString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});

		row.innerHTML = `
      <td>${post.id}</td>
      <td><span class="post-title" data-id="${post.id}">${post.title}</span></td>
      <td>${post.author}</td>
      <td>${date}</td>
      <td>${post.views}</td>
    `;
		elements.boardBody.appendChild(row);
	});

	renderPagination();
}

// ============================================
// 페이지네이션
// ============================================
function renderPagination() {
	const totalPages = Math.ceil(state.totalPosts / state.postsPerPage);
	elements.pagination.innerHTML = '';

	if (totalPages <= 1) return;

	// Prev 버튼
	if (state.currentPage > 1) {
		elements.pagination.appendChild(createPageButton('«', state.currentPage - 1));
	}

	// 페이지 버튼
	const startPage = Math.max(1, state.currentPage - 2);
	const endPage = Math.min(totalPages, startPage + 4);

	for (let i = startPage; i <= endPage; i++) {
		elements.pagination.appendChild(createPageButton(i, i, i === state.currentPage));
	}

	// Next 버튼
	if (state.currentPage < totalPages) {
		elements.pagination.appendChild(createPageButton('»', state.currentPage + 1));
	}
}

function createPageButton(label, page, active = false) {
	const btn = document.createElement('button');
	btn.textContent = label;
	if (active) btn.classList.add('active');
	btn.addEventListener('click', () => {
		state.currentPage = page;
		loadPosts();
	});
	return btn;
}

// ============================================
// 게시글 상세보기
// ============================================
async function showPostDetail(postId) {
	try {
		const post = await fetchAPI(`${API_BASE}/posts/${postId}`);
		state.currentPostId = postId;

		const date = new Date(post.created_at).toLocaleString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});

		document.getElementById('detailTitle').textContent = post.title;
		document.getElementById('detailContent').textContent = post.content;
		document.getElementById('detailInfo').textContent =
			`작성자: ${post.author} | 작성일: ${date} | 조회수: ${post.views}`;

		// 수정/삭제 버튼 표시 여부
		const editBtn = document.getElementById('editPostBtn');
		const deleteBtn = document.getElementById('deletePostBtn');
		const isOwner = state.isLoggedIn && state.currentUser && state.currentUser.nickname === post.nickname;

		if (isOwner) {
			editBtn.style.display = 'inline-flex';
			deleteBtn.style.display = 'inline-flex';
		} else {
			editBtn.style.display = 'none';
			deleteBtn.style.display = 'none';
		}

		await loadComments(postId);
		showSection('detail');
	} catch (err) {
		alert('게시글을 불러오는데 실패했습니다.');
	}
}

// ============================================
// 댓글 관리
// ============================================
async function loadComments(postId) {
	try {
		state.comments = await fetchAPI(`${API_BASE}/posts/${postId}/comments`);
		renderComments();
	} catch (err) {
		console.error('댓글 로드 오류:', err);
		state.comments = [];
		renderComments();
	}
}

function renderComments() {
	const commentList = document.getElementById('commentList');
	commentList.innerHTML = '';

	if (state.comments.length === 0) {
		commentList.innerHTML = '<li style="text-align: center; padding: 20px; color: var(--text-muted);">댓글이 없습니다.</li>';
		return;
	}

	state.comments.forEach((comment) => {
		const date = new Date(comment.created_at).toLocaleString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});

		const canDelete = state.isLoggedIn && state.currentUser &&
			state.currentUser.nickname === comment.nickname;

		const li = document.createElement('li');
		li.innerHTML = `
			<div>
				<strong>${comment.author}</strong>
				<small>${date}</small>
			</div>
			<p>${comment.content}</p>
			<div style="display: flex; gap: 8px; margin-top: 8px;">
				${state.isLoggedIn ? `<button class="reply-btn" data-id="${comment.id}">답글</button>` : ''}
				${canDelete ? `<button class="delete-comment-btn" data-id="${comment.id}">삭제</button>` : ''}
			</div>
			<div id="reply-form-${comment.id}" style="display: none; margin-top: 12px;">
				<textarea id="reply-text-${comment.id}" placeholder="답글을 입력하세요" style="min-height: 80px;"></textarea>
				<button class="submit-reply-btn" data-parent-id="${comment.id}" style="margin-top: 8px;">답글 작성</button>
			</div>
			<div id="replies-${comment.id}">
				${renderReplies(comment.replies || [])}
			</div>
    	`;
		commentList.appendChild(li);
	});
}

function renderReplies(replies) {
	if (!replies || replies.length === 0) return '';

	return replies.map((reply) => {
		const date = new Date(reply.created_at).toLocaleString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});

		const canDelete = state.isLoggedIn && state.currentUser &&
			state.currentUser.nickname === reply.nickname;

		return `
      <div style="margin-left: 20px; margin-top: 10px; padding: 12px; background: var(--bg-tertiary); border-radius: var(--radius-md); position: relative;">
        <strong>${reply.author}</strong>
        <small>${date}</small>
        <p style="margin-top: 4px;">${reply.content}</p>
        ${canDelete ? `<button class="delete-comment-btn" data-id="${reply.id}" style="position: absolute; top: 12px; right: 12px; padding: 4px 8px; font-size: 12px;">삭제</button>` : ''}
      </div>
    `;
	}).join('');
}

async function addComment(content) {
	if (!state.isLoggedIn) {
		alert('로그인이 필요합니다.');
		return;
	}

	try {
		await fetchAPI(`${API_BASE}/posts/${state.currentPostId}/comments`, {
			method: 'POST',
			body: JSON.stringify({ content }),
		});

		await loadComments(state.currentPostId);
		document.getElementById('commentInput').value = '';
	} catch (err) {
		alert(err.message || '댓글 작성에 실패했습니다.');
	}
}

async function deleteComment(commentId) {
	if (!confirm('정말 삭제하시겠습니까?')) return;

	try {
		await fetchAPI(`${API_BASE}/comments/${commentId}`, {
			method: 'DELETE',
		});

		await loadComments(state.currentPostId);
	} catch (err) {
		alert(err.message || '댓글 삭제에 실패했습니다.');
	}
}

async function addReply(commentId, content) {
	if (!state.isLoggedIn) {
		alert('로그인이 필요합니다.');
		return;
	}

	try {
		await fetchAPI(`${API_BASE}/posts/${state.currentPostId}/comments`, {
			method: 'POST',
			body: JSON.stringify({ content, parentId: commentId }),
		});

		await loadComments(state.currentPostId);
	} catch (err) {
		alert(err.message || '답글 작성에 실패했습니다.');
	}
}

// ============================================
// 게시글 작성
// ============================================
async function submitPost() {
	if (!state.isLoggedIn) {
		alert('로그인이 필요합니다.');
		return;
	}

	const title = document.getElementById('postTitle').value.trim();
	const content = document.getElementById('postContent').value.trim();

	if (!title || !content) {
		alert('제목과 내용을 입력해주세요.');
		return;
	}

	try {
		// 수정 모드인지 확인
		if (state.isEditMode) {
			await updatePost();
			return;
		}

		// 새 글 작성
		await fetchAPI(`${API_BASE}/posts`, {
			method: 'POST',
			body: JSON.stringify({ title, content }),
		});

		document.getElementById('postTitle').value = '';
		document.getElementById('postContent').value = '';

		state.currentPage = 1;
		await loadPosts();
		showSection('board');
	} catch (err) {
		alert(err.message || '게시글 작성에 실패했습니다.');
	}
}

// ============================================
// 게시글 삭제
// ============================================
async function deletePost() {
	if (!confirm('정말 삭제하시겠습니까?')) return;

	try {
		await fetchAPI(`${API_BASE}/posts/${state.currentPostId}`, {
			method: 'DELETE',
		});

		await loadPosts();
		showSection('board');
	} catch (err) {
		alert(err.message || '게시글 삭제에 실패했습니다.');
	}
}

// ============================================
// 게시글 수정
// ============================================
function showEditPost() {
	const title = document.getElementById('detailTitle').textContent;
	const content = document.getElementById('detailContent').textContent;

	// 수정 모드로 전환
	document.getElementById('postTitle').value = title;
	document.getElementById('postContent').value = content;

	// 수정 모드 플래그 설정
	state.isEditMode = true;
	state.editingPostId = state.currentPostId;

	showSection('write');
}

async function updatePost() {
	const title = document.getElementById('postTitle').value.trim();
	const content = document.getElementById('postContent').value.trim();

	if (!title || !content) {
		alert('제목과 내용을 입력해주세요.');
		return;
	}

	try {
		await fetchAPI(`${API_BASE}/posts/${state.editingPostId}`, {
			method: 'PUT',
			body: JSON.stringify({ title, content }),
		});

		document.getElementById('postTitle').value = '';
		document.getElementById('postContent').value = '';

		// 수정 모드 해제
		state.isEditMode = false;
		state.editingPostId = null;

		await showPostDetail(state.currentPostId);
	} catch (err) {
		alert(err.message || '게시글 수정에 실패했습니다.');
	}
}

// ============================================
// 이벤트 위임
// ============================================
function setupEventDelegation() {
	// 게시글 제목 클릭
	elements.boardBody.addEventListener('click', (e) => {
		if (e.target.classList.contains('post-title')) {
			const postId = parseInt(e.target.dataset.id);
			showPostDetail(postId);
		}
	});

	// 댓글 관련 버튼
	document.getElementById('commentList').addEventListener('click', async (e) => {
		const target = e.target;

		// 답글 버튼 - 답글 입력창 토글
		if (target.classList.contains('reply-btn')) {
			const commentId = target.dataset.id;
			const replyForm = document.getElementById(`reply-form-${commentId}`);
			replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
		}

		// 댓글 삭제
		if (target.classList.contains('delete-comment-btn')) {
			const commentId = parseInt(target.dataset.id);
			await deleteComment(commentId);
		}

		// 답글 작성
		if (target.classList.contains('submit-reply-btn')) {
			const parentId = parseInt(target.dataset.parentId);
			const replyText = document.getElementById(`reply-text-${parentId}`).value.trim();

			if (!replyText) {
				alert('답글 내용을 입력해주세요.');
				return;
			}

			await addReply(parentId, replyText);
			document.getElementById(`reply-form-${parentId}`).style.display = 'none';
			document.getElementById(`reply-text-${parentId}`).value = '';
		}
	});
}

// ============================================
// 이벤트 리스너
// ============================================
function setupEventListeners() {
	// 글쓰기 버튼
	document.getElementById('writeBtn').addEventListener('click', () => {
		if (!state.isLoggedIn) {
			alert('로그인이 필요합니다.');
			return;
		}
		showSection('write');
	});

	// 글쓰기 닫기
	document.getElementById('closeWriteBtn').addEventListener('click', () => {
		state.isEditMode = false;
		state.editingPostId = null;
		document.getElementById('postTitle').value = '';
		document.getElementById('postContent').value = '';
		showSection('board');
	});

	// 글쓰기 제출
	document.getElementById('submitPostBtn').addEventListener('click', submitPost);

	// 상세보기 닫기
	document.getElementById('closeDetailBtn').addEventListener('click', () => {
		loadPosts();
		showSection('board');
	});

	// 게시글 삭제
	document.getElementById('deletePostBtn').addEventListener('click', deletePost);

	// 게시글 수정
	document.getElementById('editPostBtn').addEventListener('click', showEditPost);

	// 댓글 작성
	document.getElementById('addCommentBtn').addEventListener('click', async () => {
		const commentText = document.getElementById('commentInput').value.trim();

		if (!commentText) {
			alert('댓글 내용을 입력해주세요.');
			return;
		}

		await addComment(commentText);
	});

	setupEventDelegation();
}

// ============================================
// 초기화
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
	cacheElements();
	await checkLoginStatus();
	setupEventListeners();
	await loadPosts();
	showSection('board');
});