import { GuildMember, Snowflake } from 'discord.js';

class Person {
  name: string;
  id: Snowflake;
  content: string = '';
  price: number = 0;

  constructor(member: GuildMember) {
    this.name = member.nickname || member.user.displayName;
    this.id = member.id;
  }

  order(content: string, price: number): boolean {
    if (this.#validatePrice(price)) {
      this.setContent(content);
      this.setPrice(price);
      return true;
    } else
      return false;
  }

  setContent(content: string) {
    this.content = content;
  }

  setPrice(price: number) {
    if (price > 0) this.price = price;
  }

  #validatePrice(price: number) {
    return price >= 0;
  }
}

export = Person;