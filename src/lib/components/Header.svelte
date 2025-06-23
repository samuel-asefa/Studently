<header>
	<a href="/" class="header-link">
		<h1 class="page-title">Studently</h1>
	</a>
</header>

<style>
	header {
		padding: 2rem 0;
		text-align: center;
	}

	.page-title {
		font-size: 2.2rem;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.025em;
		margin: 0;
		position: relative;
		display: inline-block;
		transition: transform 0.3s ease, color 0.3s ease;
		cursor: pointer;
	}

	.page-title:hover {
		color: var(--primary);
		transform: translateY(-2px);
	}

	.page-title::after {
		content: '';
		position: absolute;
		width: 100%;
		height: 2px;
		bottom: -4px;
		left: 0;
		background-color: var(--primary);
		transform: scaleX(0);
		transform-origin: bottom right;
		transition: transform 0.3s ease;
	}

	.page-title:hover::after {
		transform: scaleX(1);
		transform-origin: bottom left;
	}
	.header-link {
		text-decoration: none;
	}
</style>