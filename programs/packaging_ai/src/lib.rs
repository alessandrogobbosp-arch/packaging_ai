use anchor_lang::prelude::*;

declare_id!("GWwi3zRyWXLLgKU2zZrtwf2GQVVKr1LxRA2HpHGkunS3");

#[program]
pub mod packaging_ai {
    use super::*;

    pub fn initialize_access(ctx: Context<InitializeAccess>) -> Result<()> {
	let access = &mut ctx.accounts.access;
	access.owner = ctx.accounts.user.key();
	access.active = true;
	Ok(())
    }

    pub fn log_session(ctx: Context<LogSession>, problem: String) -> Result<()> {
	let session = &mut ctx.accounts.session;
	session.user = ctx.accounts.user.key();
	session.problem = problem;
	session.timestamp = Clock::get()?.unix_timestamp;
	Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeAccess<'info> {
	#[account(init, payer = user, space = 8 + 32 + 1)]
	pub access: Account<'info, Access>,
	#[account(mut)]
	pub user: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LogSession<'info> {
	#[account(init, payer = user, space = 8 + 32 + 4 + 200 + 8)]
	pub session: Account<'info, Session>,
	#[account(mut)]
	pub user: Signer<'info>,
	pub system_program: Program<'info, System>,
}

#[account]
pub struct Access {
	pub owner: Pubkey,
	pub active: bool,
}

#[account]
pub struct Session {
	pub user: Pubkey,
	pub problem: String,
	pub timestamp: i64,
}
