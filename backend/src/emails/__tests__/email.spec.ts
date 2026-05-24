/**
 * Tests for the sendEmail function.
 *
 * Verifies that dev / test / demo mode skip logic still short-circuits
 * before reaching the provider, and that production-path calls are
 * forwarded to the email provider correctly.
 */

import "mocha";
import expect from "expect";
import sinon from "sinon";
import * as emailModule from "../email";
import * as providerModule from "../providers";
import { config } from "../../config";
import { redis } from "../../redis";

describe("sendEmail", () => {
  let providerStub: sinon.SinonStub;

  beforeEach(() => {
    providerStub = sinon.stub(providerModule.emailProvider, "sendEmail").resolves();
  });

  afterEach(() => {
    providerStub.restore();
  });

  it("should stash @example.com emails in redis instead of sending", async () => {
    const redisSetStub = sinon.stub(redis, "set").resolves("OK" as any);

    const result = await emailModule.sendEmail({
      ToAddresses: ["test@example.com"],
      html: "<p>hi</p>",
      text: "hi",
      subject: "Test",
    });

    expect(result).toBe(false);
    expect(providerStub.called).toBe(false);
    expect(redisSetStub.calledOnce).toBe(true);

    redisSetStub.restore();
  });

  it("should skip sending in dev mode", async () => {
    const originalIsDev = config.isDev;
    (config as any).isDev = true;

    const result = await emailModule.sendEmail({
      ToAddresses: ["real@user.com"],
      html: "<p>hi</p>",
      text: "hi",
      subject: "Test",
    });

    expect(result).toBe(false);
    expect(providerStub.called).toBe(false);

    (config as any).isDev = originalIsDev;
  });

  it("should skip sending in demo mode", async () => {
    const originalIsDemo = config.isDemo;
    (config as any).isDemo = true;

    const result = await emailModule.sendEmail({
      ToAddresses: ["real@user.com"],
      html: "<p>hi</p>",
      text: "hi",
      subject: "Test",
    });

    expect(result).toBe(false);
    expect(providerStub.called).toBe(false);

    (config as any).isDemo = originalIsDemo;
  });

  it("should skip sending in test mode", async () => {
    // config.isTest is already true in the test environment
    const result = await emailModule.sendEmail({
      ToAddresses: ["real@user.com"],
      html: "<p>hi</p>",
      text: "hi",
      subject: "Test",
    });

    expect(result).toBe(false);
    expect(providerStub.called).toBe(false);
  });

  it("should call the provider in production mode", async () => {
    const originalIsDev = config.isDev;
    const originalIsDemo = config.isDemo;
    const originalIsTest = config.isTest;
    (config as any).isDev = false;
    (config as any).isDemo = false;
    (config as any).isTest = false;

    const result = await emailModule.sendEmail({
      ToAddresses: ["real@user.com"],
      html: "<p>hi</p>",
      text: "hi",
      subject: "Welcome",
    });

    expect(result).toBe(true);
    expect(providerStub.calledOnce).toBe(true);

    const envelope = providerStub.firstCall.args[0];
    expect(envelope.to).toEqual(["real@user.com"]);
    expect(envelope.subject).toBe("Welcome");
    expect(envelope.html).toBe("<p>hi</p>");
    expect(envelope.text).toBe("hi");
    expect(envelope.from).toContain(config.email.noReplyAddress);

    (config as any).isDev = originalIsDev;
    (config as any).isDemo = originalIsDemo;
    (config as any).isTest = originalIsTest;
  });

  it("should not send to @example.com in production mode", async () => {
    const originalIsDev = config.isDev;
    const originalIsDemo = config.isDemo;
    const originalIsTest = config.isTest;
    (config as any).isDev = false;
    (config as any).isDemo = false;
    (config as any).isTest = false;

    const result = await emailModule.sendEmail({
      ToAddresses: ["someone@example.com", "real@user.com"],
      html: "<p>hi</p>",
      text: "hi",
      subject: "Welcome",
    });

    expect(result).toBe(false);
    expect(providerStub.called).toBe(false);

    (config as any).isDev = originalIsDev;
    (config as any).isDemo = originalIsDemo;
    (config as any).isTest = originalIsTest;
  });
});
