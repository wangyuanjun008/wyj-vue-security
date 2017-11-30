import Mock from 'mockjs';

const LoginUsers = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    avatar: 'https://raw.githubusercontent.com/taylorchen709/markdown-images/master/vueadmin/user.png',
    name: '张某某'
  }
];

const Users = [];

for (let i = 0; i < 86; i++) {
  Users.push(Mock.mock({
    id: Mock.Random.guid(),
    userName: Mock.Random.string( 5, 10 ),
    password: Mock.Random.integer( 100, 10000 ),
    name: Mock.Random.cname(),
    address: Mock.mock('@county(true)'),
    'age|18-60': 1,
    phone: /^1[0-9]{10}$/,
    email: Mock.Random.email(),
    sex: Mock.Random.integer(1, 2)
  }));
}

export { LoginUsers, Users };