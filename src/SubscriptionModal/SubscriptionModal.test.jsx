import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

jest.mock("../img/퍼즐1.svg", () => ({
  __esModule: true,
  ReactComponent: (props) => <svg {...props} />,
}));

jest.mock("../img/퍼즐2.svg", () => ({
  __esModule: true,
  ReactComponent: (props) => <svg {...props} />,
}));

import SubscriptionModal from "./SubscriptionModal";

afterEach(() => {
  jest.clearAllMocks();
});

test("지금 시작하기 후 결제하기를 눌러야 구독을 시작한다", async () => {
  const onClose = jest.fn();
  const onStart = jest.fn();

  render(
    <SubscriptionModal
      onClose={onClose}
      onStart={onStart}
    />
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: "지금 시작하기",
    })
  );

  expect(
    screen.getByRole("dialog", {
      name: "결제수단",
    })
  ).toBeInTheDocument();
  expect(onStart).not.toHaveBeenCalled();

  fireEvent.click(
    screen.getByRole("button", {
      name: "결제하기",
    })
  );

  expect(onStart).toHaveBeenCalledTimes(1);

  await waitFor(() => {
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

test("결제 시트의 핸들을 누르면 혜택 모달로 돌아간다", () => {
  render(
    <SubscriptionModal
      onClose={jest.fn()}
      onStart={jest.fn()}
    />
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: "지금 시작하기",
    })
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "구독 혜택으로 돌아가기",
    })
  );

  expect(
    screen.getByRole("dialog", {
      name: /구독을 하시면/,
    })
  ).toBeInTheDocument();
});
