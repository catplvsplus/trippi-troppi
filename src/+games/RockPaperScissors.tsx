import { ActionRow, Bold, Button, Container, Heading, LineBreak, TextDisplay } from '@reciple/jsx';
import { ButtonStyle, Colors, ComponentType, MessageFlags, type ButtonBuilder, type RepliableInteraction, type User } from 'discord.js';
import { setTimeout } from 'node:timers/promises';

export class RockPaperScissors {
    public user: User;
    public enemy?: User;
    public timeout: number;

    private userChoice?: RockPaperScissors.Choice;
    private enemyChoice?: RockPaperScissors.Choice;
    private isTimeout: boolean = false;

    public get remarks(): 'draw'|'win'|'lose'|'timeout'|null {
        if (this.isTimeout) return 'timeout';
        if (this.isDraw) return 'draw';
        if (this.winner === this.user) return 'win';
        if (this.loser === this.user) return 'lose';

        return null;
    }

    public get isDraw(): boolean {
        return !!(this.userChoice || this.enemyChoice) && this.userChoice === this.enemyChoice;
    }

    public get winner(): User|null {
        return !this.isDraw && !this.isTimeout
            ? this.userChoice && this.enemyChoice
                ? RockPaperScissors.winningMap[this.userChoice] === this.enemyChoice
                    ? this.user
                    : this.enemy ?? null
                : null
            : null;
    }

    public get loser(): User|null {
        return !this.isDraw && !this.isTimeout
            ? this.userChoice && this.enemyChoice
                ? RockPaperScissors.winningMap[this.userChoice] === this.enemyChoice
                    ? this.enemy ?? null
                    : this.user
                : null
            : null;
    }

    public constructor(options: RockPaperScissors.Options) {
        this.user = options.user;
        this.enemy = options.enemy;
        this.timeout = options.timeout ?? 30000;
    }

    public async play(interaction: RepliableInteraction): Promise<RockPaperScissors.Result> {
        const message = await interaction.reply({
            flags: [MessageFlags.IsComponentsV2],
            components: <>
                <Container accentColor={this.getAccentColor()}>
                    <TextDisplay>
                        <Heading>{this.user}'s turn</Heading>
                    </TextDisplay>
                    <ActionRow>
                        {this.getButtons()}
                    </ActionRow>
                </Container>
            </>
        });

        const userChoice = await message
            .awaitMessageComponent({
                filter: (i) => i.user.id === this.user.id && ['rock', 'paper', 'scissors'].includes(i.customId),
                componentType: ComponentType.Button,
                time: this.timeout
            })
            .then(async i => {
                await i.deferUpdate();
                return i.customId as RockPaperScissors.Choice;
            })
            .catch(() => null);

        if (!userChoice) {
            this.isTimeout = true;

            await message.edit({
                components: <>
                    <Container accentColor={this.getAccentColor()}>
                        <TextDisplay>
                            <Heading level={3}>Game timed out</Heading>
                        </TextDisplay>
                    </Container>
                </>
            });

            return this.getResult();
        }

        this.userChoice = userChoice;

        await interaction.editReply({
            components: <>
                <Container accentColor={this.getAccentColor()}>
                    <TextDisplay>
                        <Heading>{this.enemy ? `${this.enemy}'s turn` : 'Waiting for opponent...'}</Heading>
                    </TextDisplay>
                    <ActionRow>
                        {this.getButtons()}
                    </ActionRow>
                </Container>
            </>
        });

        const enemyChoice = this.enemy?.bot
            ? this.getRandomChoice()
            : await message
                .awaitMessageComponent({
                    filter: (i) => (this.enemy && i.user.id === this.enemy.id || !this.enemy && i.user.id !== this.user.id) && ['rock', 'paper', 'scissors'].includes(i.customId),
                    componentType: ComponentType.Button,
                    time: this.timeout
                })
                .then(async i => {
                    await i.deferUpdate();
                    return i.customId as RockPaperScissors.Choice;
                })
                .catch(() => null);

        if (this.enemy?.bot) {
            await setTimeout(1000);
        }

        if (!enemyChoice) {
            this.isTimeout = true;

            await message.edit({
                components: <>
                    <Container accentColor={this.getAccentColor()}>
                        <TextDisplay>
                            <Heading level={3}>Game timed out</Heading>
                        </TextDisplay>
                    </Container>
                </>
            });

            return this.getResult();
        }

        this.enemyChoice = enemyChoice;

        await message.edit({
            components: <>
                <Container accentColor={this.getAccentColor()}>
                    <TextDisplay>
                        <Heading>{this.remarks === 'draw' ? 'It\'s a draw!' : `${this.winner} wins!`}</Heading>
                        <LineBreak/>
                        {this.user} chose <Bold>{this.getChoiceEmoji(this.userChoice)} {this.userChoice}</Bold>
                        <LineBreak/>
                        {this.enemy} chose <Bold>{this.getChoiceEmoji(this.enemyChoice)} {this.enemyChoice}</Bold>
                    </TextDisplay>
                </Container>
            </>
        });

        return this.getResult();
    }

    public getButtons(): ButtonBuilder[] {
        return <>
            <Button style={this.remarks ? ButtonStyle.Secondary : ButtonStyle.Primary} emoji={this.getChoiceEmoji(RockPaperScissors.Choice.Rock)} disabled={!!this.remarks} customId="rock"/>
            <Button style={this.remarks ? ButtonStyle.Secondary : ButtonStyle.Primary} emoji={this.getChoiceEmoji(RockPaperScissors.Choice.Paper)} disabled={!!this.remarks} customId="paper"/>
            <Button style={this.remarks ? ButtonStyle.Secondary : ButtonStyle.Primary} emoji={this.getChoiceEmoji(RockPaperScissors.Choice.Scissors)} disabled={!!this.remarks} customId="scissors"/>
        </>;
    }

    public getAccentColor(): number {
        switch (this.remarks) {
            case 'draw':
                return Colors.Grey;
            case 'win':
                return Colors.Green;
            case 'lose':
                return Colors.Red;
            case 'timeout':
                return Colors.Grey;
            default:
                return Colors.Blurple;
        }
    }

    public getResult(): RockPaperScissors.Result {
        return {
            remarks: this.remarks ?? 'timeout',
            winner: this.winner,
            loser: this.loser
        };
    }

    public getRandomChoice(): RockPaperScissors.Choice {
        const choices = Object.values(RockPaperScissors.Choice);
        return choices[Math.floor(Math.random() * choices.length)];
    }

    public getChoiceEmoji(choice: RockPaperScissors.Choice): string {
        switch (choice) {
            case RockPaperScissors.Choice.Rock:
                return '✊';
            case RockPaperScissors.Choice.Paper:
                return '✋';
            case RockPaperScissors.Choice.Scissors:
                return '✌️';
        }
    }
}

export namespace RockPaperScissors {
    export enum Choice {
        Rock = 'rock',
        Paper = 'paper',
        Scissors = 'scissors'
    }

    export interface Options {
        user: User;
        enemy?: User;
        timeout?: number;
    }

    export interface Result {
        remarks: 'draw'|'win'|'lose'|'timeout';
        winner: User|null;
        loser: User|null;
    }

    export const winningMap: Record<Choice, Choice> = {
        [Choice.Rock]: Choice.Scissors,
        [Choice.Paper]: Choice.Rock,
        [Choice.Scissors]: Choice.Paper
    }
}